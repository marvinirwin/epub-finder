import {PersistableEntity} from "./database.service";
import {parseCreatedAt} from "./parseCreatedAt";

export const putPersistableEntity = <T>(
  {
    entity,
    record,
  }: {
    entity: PersistableEntity,
    record: Partial<T>
  },
) => {
  const url = new URL(`${window.location.origin}/api/entities/${entity}`)
  return fetch(
    url.toString(),
    {
      method: 'POST', // *GET, POST, PUT, DELETE, etc.
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(record),
    },
  ).then(async response => {
    const item = await response.json();
    return parseCreatedAt(item);
  }).catch(e => {
    console.error(e);
    alert(`Error saving entity ${entity}`);
  })
}