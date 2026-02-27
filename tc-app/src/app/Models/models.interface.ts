import { ICurrentUsage, ISubscriptionPlan } from "./subscriptions.model";

export interface IBase {
    id?: number;
    created?: Date; 
    updated?: Date; 
    deleted?: Date; 
}

export interface IAuth {
    googleToken?: string;
    email?: string;
    password?: string;
}

export interface IUser extends IBase {
    email: string;
    password?: string;
    fullName?: string, 
    isFromGoogle?: boolean,
    avatar?: string, 
    isVerified?: boolean | number,
    verifyToken?: string,
    pwdResetToken?: string,
    pwdResetExpires?: Date,
    role: string | 'user',
    disabled?: boolean,
    
    currentPlanId?: number;
    subscriptionStatus?: 'free' | 'active' | 'expired' | 'cancelled' | 'trial';
    trialEndsAt?: Date;
    
    capsules?: ICapsule[]; 
}

export interface ICapsule extends IBase {
    userId: number;
    name: string;
    description: string;
    openDate: Date;
    isPublic?: boolean;
    isOpen?: boolean;
    isPhysical?: boolean;
    lat?: string;
    lng?: string;
    user?: IUser 
    items?: IItem[];
    recipients?: IRecipient[];
    // From subscription
    usage?: ICurrentUsage;
    plan?: ISubscriptionPlan; 
    totalUsage: number; // Redundant but needed for UI

}

export interface IItem extends IBase {
    capsuleId: number;
    contentId?: number | null;
    contentType?: string;
    data?: any;
    name?: string;
    url?: string;
    size?: number | null;
    capsule?: ICapsule;
}

export interface ILibraryItem extends IBase {
    userId: number;
    name?: string;
    contentId?: number | null;
    contentType?: string;
    data?: any;
    url?: string | null;
    size?: number | null;
    capsule?: ICapsule;
}

export interface IRecipient extends IBase {
    capsuleId: number;
    email: string;
    userId?: number;
    fullName?: string;
    hasOpened?: boolean;
    notified?: boolean;
    capsule?: ICapsule;
}

// Add these interfaces to your existing file

export interface IGlobalStats {
    totalUsers: number;
    totalCapsules: number;
    showUserCount: boolean;
    showCapsuleCount: boolean;
}

export interface IUserStats {
    totalCapsules: number;
    totalOpenCapsules: number;
    totalRecipients: number;
    totalItems: number;
}