// src/types/index.ts

export interface User {
  id: string;
  member_id: string;
  name: string;
  email: string;
  phone: string;
  password?: string;
  designation: string;
  blood_group?: string;
  date_of_birth?: string;
  created_at?: string;
  updated_at?: string;
}

export interface Member {
  id: string;
  member_id: string;
  proposer_name: string;
  proposer_membership_id: string;
  proposed_member_name: string;
  mobile_number: string;
  email_id: string;
  date_of_birth: string;
  blood_group: string;
  date_of_wedding?: string;
  spouse_name?: string;
  spouse_dob?: string;
  spouse_blood_group?: string;
  business_name?: string;
  business_address?: string;
  position?: string;
  designation: string;
  classification: string;
  is_vip: boolean;
  created_at?: string;
}

export interface Event {
  id: string;
  title: string;
  description: string;
  date: string;
  time: string;
  location: string;
  image_url?: string;
  created_at?: string;
}

export interface LoginRequest {
  membership_id: string;
  phone: string;
}

export interface OTPRequest {
  phone: string;
  otp: string;
}

export interface RegisterRequest {
  proposer_name: string;
  proposer_membership_id: string;
  proposed_member_name: string;
  mobile_number: string;
  email_id: string;
  date_of_birth: string;
  blood_group: string;
  // ... all other registration fields
}
