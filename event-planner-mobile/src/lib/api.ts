import { getToken } from './secureStorage';

const BASE_URL = process.env.EXPO_PUBLIC_API_BASE_URL ?? 'http://localhost:3000/api';

export class ApiError extends Error {
  status: number;
  code: string;

  constructor(status: number, code: string, message: string) {
    super(message);
    this.status = status;
    this.code = code;
  }
}

type RequestOptions = {
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE';
  body?: unknown;
  auth?: boolean;
};

export async function apiRequest<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const { method = 'GET', body, auth = true } = options;
  const headers: Record<string, string> = {};

  if (body !== undefined) {
    headers['Content-Type'] = 'application/json';
  }

  if (auth) {
    const token = await getToken();
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
  }

  let response: Response;
  try {
    response = await fetch(`${BASE_URL}${path}`, {
      method,
      headers,
      body: body !== undefined ? JSON.stringify(body) : undefined,
    });
  } catch {
    throw new ApiError(0, 'network_error', 'Could not connect to the server. Please check your connection.');
  }

  let data: unknown = null;
  try {
    data = await response.json();
  } catch {
    // empty or non-JSON body
  }

  if (!response.ok) {
    const errBody = data as { error?: { code?: string; message?: string } } | null;
    const code = errBody?.error?.code ?? 'unknown_error';
    const message = errBody?.error?.message ?? `Request failed with status ${response.status}.`;
    throw new ApiError(response.status, code, message);
  }

  return data as T;
}

export type AuthUser = {
  id: number;
  name: string;
  email: string;
  role: string;
};

export type AuthResponse = {
  token: string;
  user: AuthUser;
};

type JwtPayload = {
  userId: number;
  name: string;
  email: string;
  role: string;
  exp?: number;
};

export function decodeUserFromToken(token: string): AuthUser | null {
  try {
    const part = token.split('.')[1];
    if (!part) return null;
    const base64 = part.replace(/-/g, '+').replace(/_/g, '/').padEnd(
      part.length + ((4 - (part.length % 4)) % 4),
      '='
    );
    const json = typeof atob === 'function'
      ? atob(base64)
      : Buffer.from(base64, 'base64').toString('utf-8');
    const payload = JSON.parse(json) as JwtPayload;
    if (payload.exp && payload.exp * 1000 < Date.now()) return null;
    return {
      id: payload.userId,
      name: payload.name ?? payload.email,
      email: payload.email,
      role: payload.role,
    };
  } catch {
    return null;
  }
}

export function loginRequest(email: string, password: string) {
  return apiRequest<AuthResponse>('/auth/login', {
    method: 'POST',
    body: { email, password },
    auth: false,
  });
}

export function registerRequest(name: string, email: string, password: string) {
  return apiRequest<AuthResponse>('/auth/register', {
    method: 'POST',
    body: { name, email, password },
    auth: false,
  });
}

export type EventState = 'upcoming' | 'ongoing' | 'past';

export type EventListItem = {
  id: number;
  title: string;
  description: string | null;
  type: string;
  date: string;
  time: string;
  location: string;
  capacity: number;
  canceled: boolean;
  state: EventState;
  attendees: number;
  groupId: number;
  groupTitle: string;
};

export type PagedResponse<T> = {
  data: T[];
  page: number;
  limit: number;
  total: number;
  totalPages: number;
};

export function listEventsRequest(page = 1, limit = 20) {
  return apiRequest<PagedResponse<EventListItem>>(
    `/events?page=${page}&limit=${limit}`
  );
}

export type EventAttendee = {
  userId: number;
  name: string;
  photoUrl: string | null;
  extraSlots: number;
  rsvpAt: string;
};

export type EventCommentAuthor = {
  id: number;
  name: string;
  photoUrl: string | null;
};

export type EventComment = {
  id: number;
  text: string;
  createdAt: string;
  updatedAt: string;
  author: EventCommentAuthor;
};

export type EventDetails = {
  id: number;
  title: string;
  description: string | null;
  type: string;
  date: string;
  time: string;
  location: string;
  capacity: number;
  canceled: boolean;
  state: EventState;
  capacityState: 'under' | 'full' | 'over';
  attendeesCount: number;
  groupId: number;
  groupTitle: string;
  createdBy: { id: number; name: string };
  isRsvped: boolean;
  userExtraSlots: number;
  canManage: boolean;
  attendees: EventAttendee[];
  comments: EventComment[];
};

export function getEventRequest(id: number) {
  return apiRequest<EventDetails>(`/events/${id}`);
}

export function rsvpEventRequest(id: number) {
  return apiRequest<{ ok: true; isRsvped: true }>(`/events/${id}/rsvp`, {
    method: 'POST',
  });
}

export function leaveEventRequest(id: number) {
  return apiRequest<{ ok: true; isRsvped: false }>(`/events/${id}/leave`, {
    method: 'POST',
  });
}

export function setExtraSlotsRequest(id: number, extraSlots: number) {
  return apiRequest<{ ok: true; extraSlots: number }>(`/events/${id}/slots`, {
    method: 'POST',
    body: { extraSlots },
  });
}

export function listCommentsRequest(id: number, page = 1, limit = 20) {
  return apiRequest<PagedResponse<EventComment>>(
    `/events/${id}/comments?page=${page}&limit=${limit}`
  );
}

export function postCommentRequest(id: number, text: string) {
  return apiRequest<EventComment>(`/events/${id}/comments`, {
    method: 'POST',
    body: { text },
  });
}
