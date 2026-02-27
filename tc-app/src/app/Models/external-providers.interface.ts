export interface IExternalProvider {
  name: string;
  domains: string[];
  icon: string;
  supportsMetadata: boolean;
  embedSupport: boolean;
}

export interface IRemoteContent {
  id: string;
  title: string;
  description: string;
  url: string;
  thumbnailUrl?: string;
  type: string;
  size?: number; // in bytes
  provider: IExternalProvider;
  metadata?: Record<string, any>; // Additional metadata if available
  created: Date;
  updated: Date;
}