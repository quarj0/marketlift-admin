"use client";

import { useCallback, useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { SafeLink } from "@/components/ui/safe-link";
import { AdminButton } from "@/components/ui/admin-button";
import { Dialog } from "@/components/ui/dialog";
import { ActionDialog } from "@/components/ui/action-dialog";
import { graphqlRequest } from "@/lib/api-client";
import { useAdminData } from "@/components/admin/admin-data-provider";

type Option = { value: string; label: string };
type FieldDef = {
  id: string;
  label: string;
  type: string;
  required: boolean;
  filterable: boolean;
  allowCustomValue: boolean;
  placeholder: string | null;
  helpText: string | null;
  unit: string | null;
  min: number | null;
  max: number | null;
  step: number | null;
  options: Option[];
};
type Category = {
  id: string;
  name: string;
  icon: string;
  active: boolean;
  schemaVersion: number;
  description: string;
  pricing: { mode: string; label: string; placeholder: string | null };
  condition: { enabled: boolean; required: boolean };
  fields: FieldDef[];
  subcategories: { id: string; name: string; icon: string; active: boolean }[];
};
type CategoryDraft = {
  name: string;
  icon: string;
  description: string;
  active: boolean;
  pricingMode: string;
  pricingLabel: string;
  pricingPlaceholder: string;
  conditionEnabled: boolean;
  conditionRequired: boolean;
};
type FieldDraft = {
  originalId?: string;
  key: string;
  label: string;
  type: string;
  required: boolean;
  filterable: boolean;
  allowCustomValue: boolean;
  placeholder: string;
  helpText: string;
  unit: string;
  min: string;
  max: string;
  step: string;
  options: string;
};
const QUERY = `query AdminCategoryEditor { adminCategories { id name icon active schemaVersion description pricing{mode label placeholder} condition{enabled required} fields{id label type required filterable allowCustomValue placeholder helpText unit min max step options{value label}} subcategories{id name icon active} } }`;
const emptyField: FieldDraft = {
  key: "",
  label: "",
  type: "text",
  required: false,
  filterable: false,
  allowCustomValue: false,
  placeholder: "",
  helpText: "",
  unit: "",
  min: "",
  max: "",
  step: "",
  options: "",
};

const fieldTypeLabel = (type: string) =>
  (
    ({
      text: "Short answer",
      textarea: "Longer description",
      number: "Number",
      select: "Choose from a list",
      boolean: "Yes / No",
    }) as Record<string, string>
  )[type] || type;

const fieldKeyFromLabel = (label: string) =>
  label
    .trim()
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);

export default function CategoryDetailPage() {
  const { categoryId } = useParams<{ categoryId: string }>();
  const { toast, refresh } = useAdminData();
  const [category, setCategory] = useState<Category | null>(null);
  const [loading, setLoading] = useState(true);
  const [editOpen, setEditOpen] = useState(false);
  const [draft, setDraft] = useState<CategoryDraft | null>(null);
  const [fieldOpen, setFieldOpen] = useState(false);
  const [fieldDraft, setFieldDraft] = useState<FieldDraft>(emptyField);
  const [subOpen, setSubOpen] = useState(false);
  const [subName, setSubName] = useState("");
  const [busy, setBusy] = useState(false);
  const load = useCallback(async () => {
    try {
      const d = await graphqlRequest<{ adminCategories: Category[] }>(QUERY);
      setCategory(
        d.adminCategories.find((item) => item.id === categoryId) || null,
      );
    } catch (e) {
      toast(
        "Category unavailable",
        e instanceof Error ? e.message : undefined,
        "danger",
      );
    } finally {
      setLoading(false);
    }
  }, [categoryId, toast]);
  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      void load();
    }, 0);
    return () => window.clearTimeout(timeoutId);
  }, [load]);
  function editCategory() {
    if (!category) return;
    setDraft({
      name: category.name,
      icon: category.icon,
      description: category.description,
      active: category.active,
      pricingMode: category.pricing.mode,
      pricingLabel: category.pricing.label,
      pricingPlaceholder: category.pricing.placeholder || "",
      conditionEnabled: category.condition.enabled,
      conditionRequired: category.condition.required,
    });
    setEditOpen(true);
  }
  async function saveCategory() {
    if (!category || !draft || draft.name.trim().length < 2) return;
    setBusy(true);
    try {
      await graphqlRequest(
        `mutation($id:String!,$input:CategoryAdminInput!){updateCategory(categoryId:$id,input:$input){id}}`,
        {
          id: category.id,
          input: {
            name: draft.name.trim(),
            slug: category.id,
            icon: draft.icon.trim(),
            description: draft.description.trim(),
            active: draft.active,
            pricingMode: draft.pricingMode,
            pricingLabel: draft.pricingLabel.trim() || "Price",
            pricingPlaceholder: draft.pricingPlaceholder.trim() || null,
            conditionEnabled: draft.conditionEnabled,
            conditionRequired:
              draft.conditionEnabled && draft.conditionRequired,
          },
        },
      );
      setEditOpen(false);
      await Promise.all([load(), refresh()]);
      toast("Category updated");
    } catch (e) {
      toast(
        "Category could not be updated",
        e instanceof Error ? e.message : undefined,
        "danger",
      );
    } finally {
      setBusy(false);
    }
  }
  async function createSubcategory() {
    if (!category || subName.trim().length < 2) return;
    setBusy(true);
    try {
      await graphqlRequest(
        `mutation($input:CategoryAdminInput!){createCategory(input:$input){id}}`,
        {
          input: {
            name: subName.trim(),
            parentId: category.id,
            icon: "📦",
            active: true,
          },
        },
      );
      setSubName("");
      setSubOpen(false);
      await Promise.all([load(), refresh()]);
      toast("Subcategory created");
    } catch (e) {
      toast(
        "Subcategory could not be created",
        e instanceof Error ? e.message : undefined,
        "danger",
      );
    } finally {
      setBusy(false);
    }
  }
  function addField() {
    setFieldDraft(emptyField);
    setFieldOpen(true);
  }
  function editField(field: FieldDef) {
    setFieldDraft({
      originalId: field.id,
      key: field.id,
      label: field.label,
      type: field.type,
      required: field.required,
      filterable: field.filterable,
      allowCustomValue: field.allowCustomValue,
      placeholder: field.placeholder || "",
      helpText: field.helpText || "",
      unit: field.unit || "",
      min: field.min == null ? "" : String(field.min),
      max: field.max == null ? "" : String(field.max),
      step: field.step == null ? "" : String(field.step),
      options: field.options.map((o) => o.label).join("\n"),
    });
    setFieldOpen(true);
  }
  function fieldInput() {
    const originalField = fieldDraft.originalId
      ? category?.fields.find((f) => f.id === fieldDraft.originalId)
      : undefined;
    const options =
      fieldDraft.type === "select"
        ? fieldDraft.options
            .split("\n")
            .map((line) => line.trim())
            .filter(Boolean)
            .map((label, index) => ({
              label,
              value:
                originalField?.options.find((option) => option.label === label)
                  ?.value || null,
              sortOrder: index,
            }))
        : [];
    return {
      key: fieldDraft.originalId
        ? fieldDraft.key.trim()
        : fieldKeyFromLabel(fieldDraft.label),
      label: fieldDraft.label.trim(),
      type: fieldDraft.type,
      required: fieldDraft.required,
      filterable: fieldDraft.filterable,
      allowCustomValue:
        fieldDraft.type === "select" && fieldDraft.allowCustomValue,
      placeholder: fieldDraft.placeholder.trim() || null,
      helpText: fieldDraft.helpText.trim() || null,
      unit: fieldDraft.unit.trim() || null,
      min: fieldDraft.min === "" ? null : Number(fieldDraft.min),
      max: fieldDraft.max === "" ? null : Number(fieldDraft.max),
      step: fieldDraft.step === "" ? null : Number(fieldDraft.step),
      options,
      sortOrder: fieldDraft.originalId
        ? Math.max(
            0,
            category?.fields.findIndex((f) => f.id === fieldDraft.originalId) ??
              0,
          )
        : (category?.fields.length ?? 0),
    };
  }
  async function saveField() {
    if (!category || fieldDraft.label.trim().length < 2) return;
    setBusy(true);
    try {
      const input = fieldInput();
      if (fieldDraft.originalId)
        await graphqlRequest(
          `mutation($categoryId:String!,$fieldId:String!,$input:CategoryFieldAdminInput!){updateCategoryField(categoryId:$categoryId,fieldId:$fieldId,input:$input){id}}`,
          { categoryId: category.id, fieldId: fieldDraft.originalId, input },
        );
      else
        await graphqlRequest(
          `mutation($categoryId:String!,$input:CategoryFieldAdminInput!){createCategoryField(categoryId:$categoryId,input:$input){id}}`,
          { categoryId: category.id, input },
        );
      setFieldOpen(false);
      await load();
      toast(
        fieldDraft.originalId
          ? "Category field updated"
          : "Category field created",
      );
    } catch (e) {
      toast(
        "Category field could not be saved",
        e instanceof Error ? e.message : undefined,
        "danger",
      );
    } finally {
      setBusy(false);
    }
  }
  async function deleteField(field: FieldDef) {
    if (!category) return;
    try {
      const d = await graphqlRequest<{
        deleteCategoryField: { historicalValues: number };
      }>(
        `mutation($categoryId:String!,$fieldId:String!){deleteCategoryField(categoryId:$categoryId,fieldId:$fieldId){fieldId historicalValues schemaVersion}}`,
        { categoryId: category.id, fieldId: field.id },
      );
      await load();
      toast(
        "Category field deleted",
        d.deleteCategoryField.historicalValues
          ? `${d.deleteCategoryField.historicalValues} historical listing value${d.deleteCategoryField.historicalValues === 1 ? "" : "s"} retained.`
          : undefined,
        "danger",
      );
    } catch (e) {
      toast(
        "Category field could not be deleted",
        e instanceof Error ? e.message : undefined,
        "danger",
      );
    }
  }
  if (loading)
    return (
      <div className="rounded-xl border border-slate-200 bg-white p-8 text-sm text-slate-500">
        Loading category…
      </div>
    );
  if (!category)
    return (
      <div className="rounded-xl border border-slate-200 bg-white p-8 text-center">
        <h1 className="text-lg font-black">Category not found</h1>
        <SafeLink
          href="/categories"
          className="mt-4 inline-flex text-sm font-bold text-emerald-700"
        >
          Back to categories
        </SafeLink>
      </div>
    );
  return (
    <div className="space-y-6">
      <SafeLink href="/categories" className="text-xs font-bold text-slate-500">
        ← Back to categories
      </SafeLink>
      <div className="flex flex-col gap-4 rounded-xl border border-slate-200 bg-white p-5 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <span className="grid size-12 place-items-center rounded-xl bg-slate-50 text-2xl">
            {category.icon || "📦"}
          </span>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-black">{category.name}</h1>
              <span
                className={`rounded-full px-2 py-1 text-[10px] font-black ${category.active ? "bg-emerald-50 text-emerald-700" : "bg-slate-100 text-slate-500"}`}
              >
                {category.active ? "Active" : "Hidden"}
              </span>
            </div>
            <p className="mt-1 text-xs text-slate-500">
              /{category.id} · schema version {category.schemaVersion}
            </p>
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          <AdminButton variant="outline" onClick={() => setSubOpen(true)}>
            + Subcategory
          </AdminButton>
          <AdminButton onClick={editCategory}>Edit category</AdminButton>
        </div>
      </div>
      <div className="grid gap-6 xl:grid-cols-[1fr_340px]">
        <section className="rounded-xl border border-slate-200 bg-white">
          <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
            <div>
              <h2 className="text-sm font-black">Listing fields</h2>
              <p className="mt-0.5 text-xs text-slate-500">
                Fields define listing input and category-specific filters.
              </p>
            </div>
            <AdminButton onClick={addField}>+ Add field</AdminButton>
          </div>
          <div className="table-scroll">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Question</th>
                  <th>Answer style</th>
                  <th>Seller must answer</th>
                  <th>Buyer filter</th>
                  <th>Choices</th>
                  <th />
                </tr>
              </thead>
              <tbody>
                {category.fields.map((field) => (
                  <tr key={field.id}>
                    <td>
                      <div className="font-bold text-slate-900">
                        {field.label}
                      </div>
                      <div className="text-[10px] text-slate-400">
                        {field.unit
                          ? `Unit: ${field.unit}`
                          : "Used when creating a listing"}
                      </div>
                    </td>
                    <td>{fieldTypeLabel(field.type)}</td>
                    <td>{field.required ? "Yes" : "No"}</td>
                    <td>{field.filterable ? "Yes" : "No"}</td>
                    <td>
                      {field.type === "select" ? field.options.length : "—"}
                    </td>
                    <td>
                      <div className="flex justify-end gap-1">
                        <button
                          type="button"
                          onClick={() => editField(field)}
                          className="rounded-lg px-2 py-1 text-xs font-bold text-emerald-700 hover:bg-emerald-50"
                        >
                          Edit
                        </button>
                        <ActionDialog
                          trigger={
                            <button
                              type="button"
                              className="rounded-lg px-2 py-1 text-xs font-bold text-red-600 hover:bg-red-50"
                            >
                              Delete
                            </button>
                          }
                          title={`Delete ${field.label}?`}
                          description="The field will stop being available for new listing forms. Historical listing values are retained for audit and compatibility."
                          confirmLabel="Delete field"
                          tone="danger"
                          onConfirm={() => void deleteField(field)}
                        />
                      </div>
                    </td>
                  </tr>
                ))}
                {category.fields.length === 0 && (
                  <tr>
                    <td
                      colSpan={6}
                      className="py-8 text-center text-xs text-slate-500"
                    >
                      No category-specific fields are configured.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </section>
        <aside className="space-y-6">
          <section className="rounded-xl border border-slate-200 bg-white p-5">
            <h2 className="text-sm font-black">Category behavior</h2>
            <dl className="mt-4 space-y-4 text-xs">
              <Row
                label="Price"
                value={`${category.pricing.mode} · ${category.pricing.label}`}
              />
              <Row
                label="Condition"
                value={
                  category.condition.enabled
                    ? category.condition.required
                      ? "Required"
                      : "Optional"
                    : "Disabled"
                }
              />
              <Row
                label="Status"
                value={category.active ? "Active" : "Hidden"}
              />
            </dl>
            {category.description && (
              <p className="mt-4 border-t border-slate-100 pt-4 text-xs leading-5 text-slate-500">
                {category.description}
              </p>
            )}
          </section>
          <section className="rounded-xl border border-slate-200 bg-white p-5">
            <h2 className="text-sm font-black">Subcategories</h2>
            <div className="mt-4 space-y-2">
              {category.subcategories.map((sub) => (
                <div
                  key={sub.id}
                  className="flex items-center justify-between rounded-lg bg-slate-50 px-3 py-2 text-xs"
                >
                  <span className="font-bold">
                    {sub.icon || "📦"} {sub.name}
                  </span>
                  <span
                    className={
                      sub.active ? "text-emerald-700" : "text-slate-400"
                    }
                  >
                    {sub.active ? "Active" : "Hidden"}
                  </span>
                </div>
              ))}
              {category.subcategories.length === 0 && (
                <p className="text-xs text-slate-500">No subcategories.</p>
              )}
            </div>
          </section>
        </aside>
      </div>
      <Dialog
        open={editOpen}
        onClose={() => setEditOpen(false)}
        title="Edit category"
        description="Update category presentation and listing requirements."
        footer={
          <>
            <AdminButton variant="outline" onClick={() => setEditOpen(false)}>
              Cancel
            </AdminButton>
            <AdminButton
              disabled={busy || !draft?.name.trim()}
              onClick={() => void saveCategory()}
            >
              {busy ? "Saving…" : "Save category"}
            </AdminButton>
          </>
        }
      >
        {draft && (
          <div className="grid gap-4 sm:grid-cols-2">
            <Field
              label="Name"
              value={draft.name}
              onChange={(v) => setDraft((d) => d && { ...d, name: v })}
            />
            <label>
              <span className="mb-2 block text-xs font-bold">Slug</span>
              <div className="flex h-10 items-center rounded-lg border border-slate-200 bg-slate-50 px-3 text-sm text-slate-500">
                /{category.id}
              </div>
            </label>
            <Field
              label="Icon"
              value={draft.icon}
              onChange={(v) => setDraft((d) => d && { ...d, icon: v })}
            />
            <label>
              <span className="mb-2 block text-xs font-bold">Pricing mode</span>
              <select
                value={draft.pricingMode}
                onChange={(e) =>
                  setDraft((d) => d && { ...d, pricingMode: e.target.value })
                }
                className="h-10 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm"
              >
                <option value="required">Required</option>
                <option value="optional">Optional</option>
              </select>
            </label>
            <Field
              label="Pricing label"
              value={draft.pricingLabel}
              onChange={(v) => setDraft((d) => d && { ...d, pricingLabel: v })}
            />
            <Field
              label="Pricing placeholder"
              value={draft.pricingPlaceholder}
              onChange={(v) =>
                setDraft((d) => d && { ...d, pricingPlaceholder: v })
              }
            />
            <label className="sm:col-span-2">
              <span className="mb-2 block text-xs font-bold">Description</span>
              <textarea
                value={draft.description}
                onChange={(e) =>
                  setDraft((d) => d && { ...d, description: e.target.value })
                }
                className="min-h-24 w-full rounded-lg border border-slate-200 p-3 text-sm"
              />
            </label>
            <label className="flex items-center gap-2 text-xs font-bold">
              <input
                type="checkbox"
                checked={draft.active}
                onChange={(e) =>
                  setDraft((d) => d && { ...d, active: e.target.checked })
                }
              />{" "}
              Active
            </label>
            <label className="flex items-center gap-2 text-xs font-bold">
              <input
                type="checkbox"
                checked={draft.conditionEnabled}
                onChange={(e) =>
                  setDraft(
                    (d) =>
                      d && {
                        ...d,
                        conditionEnabled: e.target.checked,
                        conditionRequired: e.target.checked
                          ? d.conditionRequired
                          : false,
                      },
                  )
                }
              />{" "}
              Enable condition
            </label>
            <label className="flex items-center gap-2 text-xs font-bold">
              <input
                type="checkbox"
                disabled={!draft.conditionEnabled}
                checked={draft.conditionRequired}
                onChange={(e) =>
                  setDraft(
                    (d) => d && { ...d, conditionRequired: e.target.checked },
                  )
                }
              />{" "}
              Require condition
            </label>
          </div>
        )}
      </Dialog>
      <Dialog
        open={subOpen}
        onClose={() => setSubOpen(false)}
        title="Add subcategory"
        description={`Create a subcategory under ${category.name}.`}
        footer={
          <>
            <AdminButton variant="outline" onClick={() => setSubOpen(false)}>
              Cancel
            </AdminButton>
            <AdminButton
              disabled={busy || subName.trim().length < 2}
              onClick={() => void createSubcategory()}
            >
              {busy ? "Creating…" : "Create subcategory"}
            </AdminButton>
          </>
        }
      >
        <Field label="Subcategory name" value={subName} onChange={setSubName} />
      </Dialog>
      <Dialog
        open={fieldOpen}
        onClose={() => setFieldOpen(false)}
        title={
          fieldDraft.originalId
            ? "Edit listing question"
            : "Add listing question"
        }
        description="Choose what sellers should be asked when they post in this category. Marketlift creates the technical field name automatically."
        size="lg"
        footer={
          <>
            <AdminButton variant="outline" onClick={() => setFieldOpen(false)}>
              Cancel
            </AdminButton>
            <AdminButton
              disabled={busy || fieldDraft.label.trim().length < 2}
              onClick={() => void saveField()}
            >
              {busy ? "Saving…" : "Save question"}
            </AdminButton>
          </>
        }
      >
        <div className="grid gap-5 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <Field
              label="Question shown to the seller"
              value={fieldDraft.label}
              onChange={(v) => setFieldDraft((d) => ({ ...d, label: v }))}
            />
            <p className="mt-1 text-[11px] text-slate-500">
              Example: Storage capacity, Screen size, Number of bedrooms.
            </p>
          </div>

          <label>
            <span className="mb-2 block text-xs font-bold">
              How should the seller answer?
            </span>
            <select
              value={fieldDraft.type}
              onChange={(e) =>
                setFieldDraft((d) => ({
                  ...d,
                  type: e.target.value,
                  allowCustomValue:
                    e.target.value === "select" ? d.allowCustomValue : false,
                }))
              }
              className="h-10 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm"
            >
              <option value="text">Short answer</option>
              <option value="textarea">Longer description</option>
              <option value="number">Number</option>
              <option value="select">Choose from a list</option>
              <option value="boolean">Yes / No</option>
            </select>
            <p className="mt-1 text-[11px] text-slate-500">
              Pick the format that will be easiest for sellers to complete
              correctly.
            </p>
          </label>

          <Field
            label="Unit shown after the answer (optional)"
            value={fieldDraft.unit}
            onChange={(v) => setFieldDraft((d) => ({ ...d, unit: v }))}
          />
          <Field
            label="Example answer (optional)"
            value={fieldDraft.placeholder}
            onChange={(v) => setFieldDraft((d) => ({ ...d, placeholder: v }))}
          />
          <Field
            label="Extra guidance for sellers (optional)"
            value={fieldDraft.helpText}
            onChange={(v) => setFieldDraft((d) => ({ ...d, helpText: v }))}
          />

          {fieldDraft.type === "number" && (
            <>
              <Field
                label="Smallest allowed value (optional)"
                type="number"
                value={fieldDraft.min}
                onChange={(v) => setFieldDraft((d) => ({ ...d, min: v }))}
              />
              <Field
                label="Largest allowed value (optional)"
                type="number"
                value={fieldDraft.max}
                onChange={(v) => setFieldDraft((d) => ({ ...d, max: v }))}
              />
              <Field
                label="Allowed increment (optional)"
                type="number"
                value={fieldDraft.step}
                onChange={(v) => setFieldDraft((d) => ({ ...d, step: v }))}
              />
            </>
          )}

          <div className="sm:col-span-2 rounded-xl border border-slate-200 bg-slate-50 p-4">
            <p className="text-xs font-black text-slate-800">
              How this question behaves
            </p>
            <div className="mt-3 space-y-3">
              <Check
                label="Sellers must answer this question"
                checked={fieldDraft.required}
                onChange={(v) => setFieldDraft((d) => ({ ...d, required: v }))}
              />
              <Check
                label="Buyers can use this answer as a search filter"
                checked={fieldDraft.filterable}
                onChange={(v) =>
                  setFieldDraft((d) => ({ ...d, filterable: v }))
                }
              />
              {fieldDraft.type === "select" && (
                <Check
                  label="Allow sellers to enter an answer that is not in the list"
                  checked={fieldDraft.allowCustomValue}
                  onChange={(v) =>
                    setFieldDraft((d) => ({ ...d, allowCustomValue: v }))
                  }
                />
              )}
            </div>
          </div>

          {fieldDraft.type === "select" && (
            <label className="sm:col-span-2">
              <span className="mb-2 block text-xs font-bold">
                Answers sellers can choose from
              </span>
              <textarea
                value={fieldDraft.options}
                onChange={(e) =>
                  setFieldDraft((d) => ({ ...d, options: e.target.value }))
                }
                className="min-h-36 w-full rounded-lg border border-slate-200 p-3 text-sm"
                placeholder={"8 GB\n12 GB\n16 GB"}
              />
              <span className="mt-1 block text-[11px] text-slate-500">
                Enter one choice per line. Marketlift creates the internal
                values automatically.
              </span>
            </label>
          )}
        </div>
      </Dialog>
    </div>
  );
}
function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between gap-3">
      <dt className="text-slate-500">{label}</dt>
      <dd className="max-w-[65%] text-right font-bold text-slate-800">
        {value}
      </dd>
    </div>
  );
}
function Field({
  label,
  value,
  onChange,
  type = "text",
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  type?: string;
}) {
  return (
    <label>
      <span className="mb-2 block text-xs font-bold">{label}</span>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="h-10 w-full rounded-lg border border-slate-200 px-3 text-sm outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/10"
      />
    </label>
  );
}
function Check({
  label,
  checked,
  onChange,
}: {
  label: string;
  checked: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <label className="flex items-center gap-2 text-xs font-bold">
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
      />
      {label}
    </label>
  );
}
