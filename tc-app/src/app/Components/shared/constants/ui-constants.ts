/**
 * Centralized constants for UI elements to ensure consistency across components
 */
export const UI_CONSTANTS = {
  actions: {
    view: {
      translationKey: 'common.actions.view',
      icon: 'visibility',
      tooltip: 'common.tooltips.view'
    },
    edit: {
      translationKey: 'common.actions.edit',
      icon: 'edit',
      tooltip: 'common.tooltips.edit'
    },
    delete: {
      translationKey: 'common.actions.delete',
      icon: 'delete',
      tooltip: 'common.tooltips.delete'
    },
    create: {
      translationKey: 'common.actions.create',
      icon: 'add',
      tooltip: 'common.tooltips.create'
    }
  },
  status: {
    visibility: {
      public: {
        icon: 'public',
        tooltip: 'common.status.visibility.public'
      },
      private: {
        icon: 'lock',
        tooltip: 'common.status.visibility.private'
      }
    },
    access: {
      opened: {
        icon: 'visibility',
        tooltip: 'common.status.access.opened'
      },
      openable: {
        icon: 'lock_open',
        tooltip: 'common.status.access.openable'
      },
      locked: {
        icon: 'lock_clock',
        tooltip: 'common.status.access.locked'
      }
    },
    location: {
      digital: {
        icon: 'cloud',
        tooltip: 'common.status.location.digital'
      },
      physical: {
        icon: 'place',
        tooltip: 'common.status.location.physical'
      }
    }
  },
  metadata: {
    creationDate: {
      icon: 'event',
      tooltip: 'common.metadata.created_on'
    },
    openDate: {
      icon: 'event_available',
      tooltip: 'common.metadata.opens_on'
    },
    items: {
      icon: 'attach_file',
      tooltip: 'common.metadata.items_count'
    },
    recipients: {
      icon: 'person',
      tooltip: 'common.metadata.recipients_count'
    }
  }
};