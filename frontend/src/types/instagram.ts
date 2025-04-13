export interface InstagramUser {
    id: string;
    username: string;
    name: string;
    account_type?: string;
    media_count?: number;
    followers_count?: number;
    follows_count?: number;
    profile_picture_url?: string;
    biography?: string;
    website?: string;
  }
  
  export interface InstagramAuthResponse {
    access_token: string;
    user_id: string;
  }

  export interface InstagramMedia {
    id: string;
    caption?: string;
    media_type: 'IMAGE' | 'VIDEO' | 'CAROUSEL_ALBUM';
    media_url: string;
    permalink: string;
    timestamp: string;
    username: string;
    comments_count?: number;
    like_count?: number;
  }
  
  export interface InstagramComment {
    id: string;
    text: string;
    username: string;
    timestamp: string;
    parent_id: string;
    replies?: InstagramComment[];
    like_count: number;
    from: {
      username: string;
    }

  }
  
  export interface PostCommentResponse {
    id: string;
  }