import { ReplaySubject } from "rxjs";
import { DroppedFilesService } from "./dropped-files.service";
import { DocumentCheckingOutService } from "../../components/library/document-checking-out.service";
import { LibraryService } from "../manager/library.service";
import { ProgressItemService } from "../../components/item-in-progress/progress-item.service";
import { LanguageConfigsService } from "../language/language-configs.service";
import { observableLastValue, SettingsService } from "../../services/settings.service";
import { ModalService } from "../user-interface/modal.service";

const supportedFileExtensions = new Set<string>([
  "pdf",
  "docx",
  "txt",
  "html",
  "png",
  "jpeg",
  "jpg",
  "svg",
  "bmp"
]);

/**
 * Once a file is dropped we check if a user is logged in, if they're not raise an error
 * Then we persist with the repository
 * Then we set the editing one
 * Then there's another service which loads them later
 */
export class UploadingDocumentsService {
  uploadingMessages$ = new ReplaySubject<string>(1);
  currentUploadingFile$ = new ReplaySubject<File | undefined>(1);
  private libraryService: LibraryService;
  private progressItemService: ProgressItemService;
  private settingsService: SettingsService;
  private modalService: ModalService;

  constructor({
                libraryService,
                progressItemService,
                languageConfigsService,
                settingsService,
                modalService
              }: {
    progressItemService: ProgressItemService
    documentCheckingOutService: DocumentCheckingOutService
    libraryService: LibraryService,
    languageConfigsService: LanguageConfigsService,
    settingsService: SettingsService
    modalService: ModalService
  }) {
    this.settingsService = settingsService;
    this.libraryService = libraryService;
    this.progressItemService = progressItemService;
    this.modalService = modalService;
    this.currentUploadingFile$.next();
  }

  async upload({ file, language_code }: { file: File, language_code: string }) {
    if (!supportedFileExtensions.has(DroppedFilesService.extensionFromFilename(file.name))) {
      throw new Error(`Unsupported file extension ${file.name}`);
    }
    return this.progressItemService.newProgressItem().exec(async () => {
      let lastDocument: string | undefined;
      lastDocument = file.name;
      this.uploadingMessages$.next(
        `Uploading ${file.name}...`
      );
      this.currentUploadingFile$.next(file);
      const uploadedDocuments = await this.libraryService.upsertDocument(file, language_code);
      this.currentUploadingFile$.next(undefined);
      this.uploadingMessages$.next(
        `Uploading ${file.name} success!`
      );
      this.settingsService.selectedFrequencyDocuments$.next(
        (await observableLastValue(this.settingsService.selectedFrequencyDocuments$))
          .concat(uploadedDocuments.id())
      );
      this.settingsService.selectedExampleSegmentDocuments$.next(
        (await observableLastValue(this.settingsService.selectedExampleSegmentDocuments$))
          .concat(uploadedDocuments.id())
      );
      this.settingsService.readingDocument$.next(uploadedDocuments.id());
    });
  }
}
