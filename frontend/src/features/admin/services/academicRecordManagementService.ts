import api from "../../../config/api";

import type {
  AcademicRecord,
  CreateAcademicRecordPayload,
} from "../types/academicRecordManagement";

function getAuthHeaders(token: string) {
  return {
    Authorization: `Bearer ${token}`,
  };
}

export async function getAcademicRecords(
  token: string,
): Promise<AcademicRecord[]> {
  const response = await api.get<AcademicRecord[]>(
    "/academic-records/",
    {
      headers: getAuthHeaders(token),
    },
  );

  return response.data;
}

export async function getAcademicRecordById(
  token: string,
  recordId: number,
): Promise<AcademicRecord> {
  const response = await api.get<AcademicRecord>(
    `/academic-records/${recordId}`,
    {
      headers: getAuthHeaders(token),
    },
  );

  return response.data;
}

export async function createAcademicRecord(
  token: string,
  payload: CreateAcademicRecordPayload,
): Promise<AcademicRecord> {
  const response = await api.post<AcademicRecord>(
    "/academic-records/",
    payload,
    {
      headers: getAuthHeaders(token),
    },
  );

  return response.data;
}

export async function updateAcademicRecord(
  token: string,
  recordId: number,
  payload: CreateAcademicRecordPayload,
): Promise<AcademicRecord> {
  const response = await api.put<AcademicRecord>(
    `/academic-records/${recordId}`,
    payload,
    {
      headers: getAuthHeaders(token),
    },
  );

  return response.data;
}