// Definiamo prima l'interfaccia per queste statistiche più complete
export interface IDetailedStats {
    totals: {
      users: number;
      capsules: {
        count: number;
        public: {
          count: number;
          openable: number;
          opened: number;
          items: {
            count: number;
            totalSizeBytes: number;
            byCategory: {
              images: { count: number; sizeBytes: number };
              videos: { count: number; sizeBytes: number };
              audio: { count: number; sizeBytes: number };
              documents: { count: number; sizeBytes: number };
              other: { count: number; sizeBytes: number };
            }
          }
        };
        private: {
          count: number;
          openable: number;
          opened: number;
          items: {
            count: number;
            totalSizeBytes: number;
            byCategory: {
              images: { count: number; sizeBytes: number };
              videos: { count: number; sizeBytes: number };
              audio: { count: number; sizeBytes: number };
              documents: { count: number; sizeBytes: number };
              other: { count: number; sizeBytes: number };
            }
          }
        };
      };
      recipients: {
        unique: number;
        total: number;
        opened: number;
      };
      library: {
        items: number;
        sizeBytes: number;
        unused: number;
        byCategory: {
          images: { count: number; sizeBytes: number };
          videos: { count: number; sizeBytes: number };
          audio: { count: number; sizeBytes: number };
          documents: { count: number; sizeBytes: number };
          other: { count: number; sizeBytes: number };
        }
      };
    };
  }