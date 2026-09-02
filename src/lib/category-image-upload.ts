import {
  API_BASE_URL,
  apiRequest,
  ensureCsrfToken,
} from "@/lib/api-client";

type PreparedUpload = {
  upload: { id: string };
  target: {
    method: string;
    url: string;
    headers?: Record<string, string>;
    fields?: Record<string, string>;
  };
};

function resolveTargetUrl(value: string) {
  return new URL(value, `${API_BASE_URL}/`).toString();
}

function sameApiOrigin(url: string) {
  try {
    return new URL(url).origin === new URL(API_BASE_URL).origin;
  } catch {
    return false;
  }
}

export async function uploadCategoryImage(file: File) {
  const prepared = await apiRequest<PreparedUpload>("/api/v1/uploads/prepare/", {
    method: "POST",
    body: JSON.stringify({
      purpose: "category_image",
      name: file.name,
      mimeType: file.type,
      size: file.size,
    }),
  });

  const targetUrl = resolveTargetUrl(prepared.target.url);
  const headers = new Headers(prepared.target.headers || {});
  let body: BodyInit = file;

  if (sameApiOrigin(targetUrl)) {
    const csrf = await ensureCsrfToken();
    if (csrf) headers.set("X-CSRFToken", csrf);
  }

  if (prepared.target.fields && Object.keys(prepared.target.fields).length) {
    const form = new FormData();
    Object.entries(prepared.target.fields).forEach(([key, value]) =>
      form.append(key, value),
    );
    form.append("file", file);
    body = form;
    headers.delete("Content-Type");
  }

  const response = await fetch(targetUrl, {
    method: prepared.target.method || "PUT",
    headers,
    body,
    credentials: sameApiOrigin(targetUrl) ? "include" : "omit",
  });

  if (!response.ok) {
    throw new Error("Category image upload failed.");
  }

  await apiRequest(`/api/v1/uploads/${prepared.upload.id}/complete/`, {
    method: "POST",
    body: JSON.stringify({}),
  });

  return prepared.upload.id;
}
