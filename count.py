import hashlib
import json
import os
import re
import unicodedata

import ebooklib
from hanziconv import HanziConv
from bs4 import BeautifulSoup
import epub
import sqlite3

RE = re.compile(u'[⺀-⺙⺛-⻳⼀-⿕々〇〡-〩〸-〺〻㐀-䶵一-鿃豈-鶴侮-頻並-龎]', re.UNICODE)

con = sqlite3.connect('test.db')
con.isolation_level = None
con.set_trace_callback(print)


def dict_factory(cursor, row):
    d = {}
    for idx, col in enumerate(cursor.description):
        d[col[0]] = row[idx]
    return d


con.row_factory = dict_factory

c = con.cursor()


class WordCount:
    def __init__(self, book_name: str, section_id: str, text: str, method: str):
        if single_section_persisted(section_id):
            return

        counts = get_word_counts(text)

        book_id = insert_single_section(book_name, section_id, text, method)

        for char in counts:
            insert_count(book_id, char, counts)


def exec_insert(sql, params):
    c.execute(sql, params)
    return c.lastrowid


def select(sql, params):
    c.execute(sql, params)

    rows = c.fetchall()
    return rows


def method_used(method, book):
    return len(select('''
    SELECT 1 FROM
    book_range 
    WHERE br_method = ? AND br_book = ? 
    ''', (method, book)))


if False:
    c.executescript('''
    -- Assume indexes are also dropped with these
    DROP TABLE IF EXISTS range_stat;
    DROP TABLE IF EXISTS book_range;
    DROP TABLE IF EXISTS vocab;
    CREATE TABLE 
    range_stat (
      rs_character TEXT, 
      rs_count TEXT, 
      rs_range_id INTEGER,
      rs_create_timestamp TIMESTAMP
      DEFAULT CURRENT_TIMESTAMP
     );
     
    CREATE TABLE IF NOT EXISTS book_range (
      br_book TEXT,
      br_range_start TEXT,
      br_range_end TEXT,
      br_text TEXT,
      br_method TEXT NOT NULL
    );
    CREATE UNIQUE INDEX idx_br_range_start_br_range_end 
    ON book_range(br_range_start, br_range_end, br_method);
    CREATE TABLE vocab (
    v_hash TEXT,
    v_character TEXT
    );
    CREATE INDEX idx_v_hash ON vocab(v_hash);
    ''')


def insert_vocab(vocab_hashed, char):
    c.execute('''
    INSERT INTO vocab (v_hash, v_character) VALUES(?, ?)
    ''', (vocab_hashed, char))


def vocab_is_present(vocab_list_hashed: str):
    return len(select(
        '''
        SELECT 1 FROM vocab WHERE v_hash = ?
        ''',
        (vocab_list_hashed,)
    ))


def index_by_manifest_value(filename, method):
    book = epub.open_epub("reader/public/" + filename)
    for item in book.opf.manifest.values():
        # read the content
        data = book.read_item(item)
        soup = BeautifulSoup(data, 'html.parser')
        body = soup.find('body')
        if body is not None:
            print(item.identifier)
            find_all = body.findAll(text=True)
            WordCount(filename, item.identifier, "\n".join(find_all), method)


def insert_count(book_id, char, counts):
    exec_insert('''
        INSERT INTO range_stat (
        rs_character, 
        rs_count, 
        rs_range_id
        ) VALUES(?,?,?) ''', (char, counts[char], book_id))


def insert_single_section(book_name, section, text, method):
    return exec_insert('''
        INSERT INTO book_range 
        (br_book, br_range_start, br_range_end, br_text, br_method) 
        VALUES(?, ?, '', ?, ?)
        ''', (book_name, section, text, method))


def get_word_counts(text):
    counts = {}
    for char in text:
        if RE.match(char):
            if char in counts:
                counts[char] += 1
            else:
                counts[char] = 1
    return counts


def single_section_persisted(section):
    return len(select('''
    SELECT 1 FROM book_range WHERE br_range_start = ? AND br_range_end = ''
    ''', (section,)))


books = [
    ('老舍全集.epub', index_by_manifest_value, 'manifest_value'),
    ('pg23962.epub', index_by_manifest_value, 'manifest_value')
]


def index_books():
    for (filename, index_func, method) in books:
        if not method_used(method, filename):
            c.execute('BEGIN;')
            index_func(filename, method)
            c.execute('COMMIT;')


def get_vocab():
    global f, charset, word
    with open('./hsk.json', 'r') as f:
        words = json.load(f)
    charset = {}
    for word in words:
        for char in unicodedata.normalize('NFC', word['hanzi']):
            charset[char] = 1
    return charset


def get_vocab_hash(character_list: list):
    vocab_hashed = hashlib.md5("".join(character_list).encode('utf-8')).hexdigest()
    if not vocab_is_present(vocab_hashed):
        c.execute("BEGIN;")
        for char in character_list:
            insert_vocab(vocab_hashed, char)
        c.execute("COMMIT;")
    return vocab_hashed


if __name__ == "__main__":
    index_books()
    vocab_set = get_vocab()
    keys = list(vocab_set.keys())
    vocab_hash = get_vocab_hash(keys)
    results = select(
        '''
WITH v AS (
  SELECT v_character
  FROM vocab
  WHERE v_hash = ?
),
     totals as (
       SELECT SUM(known.rs_count) known_count,
              SUM( `unknown`.rs_count) unknown_count,
              br_book, 
              br_range_start,
              br_range_end
       FROM book_range
              LEFT JOIN range_stat AS known
                        ON known.rs_range_id = book_range.ROWID AND known.rs_character IN (SELECT * FROM v)
              LEFT JOIN range_stat AS unknown
                        ON
                            `unknown`.rs_range_id = book_range.ROWID AND
                            `unknown`.rs_character NOT IN (SELECT * FROM v)
       GROUP BY br_range_start, br_range_end
     )
  SELECT
     *,
     (unknown_count * 1.0 / known_count) AS `ratio`
  FROM
     totals
  WHERE 
    known_count + unknown_count > 50
  ORDER BY unknown_count * 1.0 / known_count
  LIMIT 1;
        ''',
        (vocab_hash,)
    )

    with open('reader/src/ranges.json', 'w') as f:
        json.dump(results, f, ensure_ascii=False)
