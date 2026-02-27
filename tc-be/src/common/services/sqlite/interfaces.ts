  export interface CapsuleContentRow {
    id?: number;
    userId: number;
    capsuleId?: number;
    size?: number;
    name?: string;
    contentType: string;
    content: Buffer;
    created_at?: string;
    updated_at?: string;
  }