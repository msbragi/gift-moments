import { IRemoteContent } from '../../Models/external-providers.interface';

/**
 * Configuration for the external link dialog
 */
export interface ExternalLinkDialogData {
  /** Title of the dialog */
  title?: string;
  /** Placeholder text for URL input */
  placeholder?: string;
  /** Initial URL value */
  initialUrl?: string;
  /** Whether to show preview */
  showPreview?: boolean;
  /** Whether the dialog is in readonly mode (for viewing only) */
  readonly?: boolean;
  /** Pre-loaded remote content for readonly mode */
  remoteContent?: IRemoteContent;
}

/**
 * Result returned from the external link dialog
 */
export interface ExternalLinkDialogResult {
  /** Whether the dialog was confirmed */
  confirmed: boolean;
  /** The validated URL */
  url?: string;
  /** Extracted remote content metadata */
  remoteContent?: IRemoteContent;
}

/**
 * State of URL validation in the dialog
 */
export interface UrlValidationState {
  /** Whether URL is valid */
  isValid: boolean;
  /** Whether validation is in progress */
  isValidating: boolean;
  /** Validation error message */
  error?: string;
  /** Provider name if URL is supported */
  providerName?: string;
  /** Whether URL supports embedding */
  supportsEmbed?: boolean;
}
