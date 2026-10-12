import { isFactoryUploadAuthed } from "@/lib/factory-video-auth";

/**
 * The inquiry desk reuses the factory password and its signed session cookie,
 * so lead capture needs no extra credential.
 */
export const isInquiryDeskAuthed = isFactoryUploadAuthed;
