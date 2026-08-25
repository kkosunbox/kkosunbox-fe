export interface PartnershipInquiryDto {
  id: number;
  companyName: string;
  contactName: string;
  content: string;
  email: string;
  phone: string;
  attachmentUrls?: string[];
  referenceLinks?: string[];
  createdAt: string;
}

export interface CreatePartnershipInquiryRequest {
  companyName: string;
  contactName: string;
  content: string;
  email: string;
  phone: string;
  attachmentUrls?: string[];
  referenceLinks?: string[];
}

export interface CreatePartnershipInquiryResponse {
  partnershipInquiry: PartnershipInquiryDto;
}
