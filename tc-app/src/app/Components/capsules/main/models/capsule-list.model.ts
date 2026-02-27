
/**
 * Defines the type of action that can be performed on a capsule
 */
export interface CapsuleAction {
  type: 'new' | 'view' | 'edit' | 'delete';
  capsuleId: number;
}

/**
 * Constants for capsule status icons
 */
export const CAPSULE_ICONS = {
  public: 'public',
  private: 'lock',
  physical: 'inventory_2',
  digital: 'cloud',
  open: 'lock_open',
  closed: 'lock_clock'
};