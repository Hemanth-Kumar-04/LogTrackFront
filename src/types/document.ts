export interface Document {
  _id: string;
  filename: string;
  shipment_id: string;
  sender: string;
  receiver: string;
  destination: string;
  weight: string;
  date: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
}

export interface AuthContextType {
  user: User | null;
  token: string | null;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  logout: () => void;
  isLoading: boolean;
}