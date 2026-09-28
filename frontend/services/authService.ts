import { createClient } from '@/utils/supabase/client';

export interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  created_at?: string;
  updated_at?: string;
}

export interface AuthResponse {
  success: boolean;
  message: string;
  error_code?: string;
  data?: {
    user?: User;
    access_token?: string;
    token_type?: string;
  } | null;
}

// Disallowed fake/throwaway/demo email domains
const FAKE_EMAIL_DOMAINS = [
  'khfb.com', 'test.com', 'example.com', 'fake.com', 'mailinator.com',
  'dispostable.com', '10minutemail.com', 'tempmail.com', 'trashmail.com',
  'yopmail.com', 'guerrillamail.com', 'sharklasers.com'
];

function isRealEmailDomain(email: string): { isValid: boolean; reason?: string } {
  const emailClean = email.trim().toLowerCase();
  
  // Standard RFC 5322 pattern
  const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,10}$/;
  if (!emailRegex.test(emailClean)) {
    return { isValid: false, reason: 'Invalid email format. Please enter a valid email address.' };
  }

  const parts = emailClean.split('@');
  if (parts.length !== 2) {
    return { isValid: false, reason: 'Invalid email address.' };
  }

  const domain = parts[1];

  // Block known fake/throwaway domains
  if (FAKE_EMAIL_DOMAINS.includes(domain)) {
    return { isValid: false, reason: `The domain "${domain}" is not accepted. Please use a legitimate email address.` };
  }

  // Ensure domain has at least a valid extension and length
  const domainParts = domain.split('.');
  if (domainParts.length < 2 || domainParts[0].length < 2 || domainParts[1].length < 2) {
    return { isValid: false, reason: 'Please enter a valid, active email domain.' };
  }

  return { isValid: true };
}

export const authService = {
  async register(name: string, email: string, password: string): Promise<AuthResponse> {
    const domainCheck = isRealEmailDomain(email);
    if (!domainCheck.isValid) {
      return {
        success: false,
        message: domainCheck.reason || 'Invalid email address.',
        error_code: 'INVALID_EMAIL_DOMAIN',
      };
    }

    try {
      const supabase = createClient();
      const { data, error } = await supabase.auth.signUp({
        email: email.trim(),
        password,
        options: {
          data: {
            full_name: name.trim(),
            role: 'INVESTIGATOR',
          },
        },
      });

      if (error) {
        return {
          success: false,
          message: error.message,
          error_code: error.code || 'SIGNUP_ERROR',
        };
      }

      const user = data.user;
      if (!user) {
        return {
          success: false,
          message: 'Failed to create user account.',
        };
      }

      const formattedUser: User = {
        id: user.id,
        name: user.user_metadata?.full_name || name || user.email?.split('@')[0] || 'Investigator',
        email: user.email || email,
        role: user.user_metadata?.role || 'INVESTIGATOR',
        created_at: user.created_at,
      };

      return {
        success: true,
        message: 'Account created successfully!',
        data: {
          user: formattedUser,
          access_token: data.session?.access_token || '',
          token_type: 'bearer',
        },
      };
    } catch (err: any) {
      return {
        success: false,
        message: err.message || 'Registration failed.',
      };
    }
  },

  async login(email: string, password: string): Promise<AuthResponse> {
    const domainCheck = isRealEmailDomain(email);
    if (!domainCheck.isValid) {
      return {
        success: false,
        message: domainCheck.reason || 'Invalid email address.',
        error_code: 'INVALID_EMAIL_DOMAIN',
      };
    }

    try {
      const supabase = createClient();
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      });

      if (error) {
        return {
          success: false,
          message: error.message, // e.g. "Invalid login credentials"
          error_code: error.code || 'LOGIN_ERROR',
        };
      }

      const user = data.user;
      if (!user) {
        return {
          success: false,
          message: 'Invalid credentials.',
        };
      }

      const formattedUser: User = {
        id: user.id,
        name: user.user_metadata?.full_name || user.email?.split('@')[0] || 'Investigator',
        email: user.email || email,
        role: user.user_metadata?.role || 'INVESTIGATOR',
        created_at: user.created_at,
      };

      return {
        success: true,
        message: 'Login successful.',
        data: {
          user: formattedUser,
          access_token: data.session?.access_token || '',
          token_type: 'bearer',
        },
      };
    } catch (err: any) {
      return {
        success: false,
        message: err.message || 'Login failed.',
      };
    }
  },

  async getCurrentUser(token?: string): Promise<AuthResponse> {
    try {
      const supabase = createClient();
      const { data, error } = await supabase.auth.getUser();

      if (error || !data.user) {
        return {
          success: false,
          message: 'No active session',
        };
      }

      const user = data.user;
      const formattedUser: User = {
        id: user.id,
        name: user.user_metadata?.full_name || user.email?.split('@')[0] || 'Investigator',
        email: user.email || '',
        role: user.user_metadata?.role || 'INVESTIGATOR',
        created_at: user.created_at,
      };

      return {
        success: true,
        message: 'User retrieved',
        data: {
          user: formattedUser,
        },
      };
    } catch (err: any) {
      return {
        success: false,
        message: err.message || 'Failed to fetch current user',
      };
    }
  },

  async logout(): Promise<void> {
    try {
      const supabase = createClient();
      await supabase.auth.signOut();
    } catch (err) {
      console.error('Logout error:', err);
    }
  },
};
