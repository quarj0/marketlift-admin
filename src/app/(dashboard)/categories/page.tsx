"use client";

import { useState } from "react";
import { PageHeader } from "@/components/ui/page-header";
import { AdminButton } from "@/components/ui/admin-button";
import { Dialog } from "@/components/ui/dialog";
import { ActionDialog } from "@/components/ui/action-dialog";
import { useAdminData } from "@/components/admin/admin-data-provider";
import { graphqlRequest } from "@/lib/api-client";
import { Icons } from "@/lib/icons";
import { SafeLink } from "@/components/ui/safe-link";
import Image from "next/image";

export default function CategoriesPage() {
  const [open,setOpen]=useState(false); const [name,setName]=useState(""); const [busy,setBusy]=useState(false);
  const {toast,deleteCategory,categories,refresh}=useAdminData();
  async function toggle(slug:string,active:boolean){try{await graphqlRequest(`mutation($id:String!,$active:Boolean!){setCategoryActive(categoryId:$id,active:$active){id active}}`,{id:slug,active:!active});await refresh();toast("Category visibility updated");}catch(e){toast("Category update failed",e instanceof Error?e.message:undefined,"danger");}}
  async function create(){const clean=name.trim();if(clean.length<2)return;setBusy(true);try{await graphqlRequest(`mutation($input:CategoryAdminInput!){createCategory(input:$input){id name active}}`,{input:{name:clean,icon:"📦",active:true}});setName("");setOpen(false);await refresh();toast("Category created",`${clean} is now available in the marketplace catalog.`);}catch(e){toast("Category could not be created",e instanceof Error?e.message:undefined,"danger");}finally{setBusy(false);}}
  return <div className="space-y-6">
    <PageHeader title="Categories" description="Manage the category and subcategory structure used by the public marketplace." actions={<AdminButton onClick={()=>setOpen(true)}>+ Add category</AdminButton>}/>
    <div className="rounded-xl border border-emerald-200 bg-emerald-50/50 px-4 py-3 text-xs leading-5 text-emerald-900">Category visibility can be changed at any time. Deleting a category is permanent and requires confirmation.</div>
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">{categories.map((category)=><article key={category.slug} className="rounded-xl border border-slate-200 bg-white p-5 transition hover:-translate-y-0.5 hover:shadow-lg hover:shadow-slate-950/5"><div className="flex items-start justify-between gap-3">{category.imageUrl ? <Image
                      src={category.imageUrl}
                      alt=""
                      width={56}
                      height={56}
                      className="size-14 shrink-0 rounded-xl object-cover"
                    /> : <span className="grid size-11 shrink-0 place-items-center rounded-xl bg-slate-50 text-xl">{category.icon||"📦"}</span>}<div className="flex items-center gap-1.5"><button type="button" onClick={()=>void toggle(category.slug,category.active)} className="rounded-lg border border-slate-200 px-2.5 py-1.5 text-[10px] font-black text-slate-600 hover:bg-slate-50">{category.active?"Hide":"Show"}</button><ActionDialog trigger={<button type="button" aria-label={`Delete ${category.name}`} className="grid size-8 place-items-center rounded-lg border border-red-200 text-red-700 hover:bg-red-50"><Icons.trash size={14}/></button>} title={`Delete ${category.name} permanently?`} description="The category and its subcategory structure will be removed. Listings that reference it will require reassignment before they can be republished." confirmLabel="Delete category" tone="danger" onConfirm={()=>void deleteCategory(category.slug,category.name)}/></div></div><h2 className="mt-4 text-sm font-black text-slate-900">{category.name}</h2><p className="mt-1 text-[11px] text-slate-400">/{category.slug}</p>{category.subcategories.length>0&&<div className="mt-4"><p className="text-[10px] font-black uppercase tracking-wide text-slate-400">Subcategories</p><div className="mt-2 flex flex-wrap gap-1.5">{category.subcategories.slice(0,6).map((sub)=><span key={sub.id} className="rounded-full bg-slate-100 px-2 py-1 text-[10px] font-semibold text-slate-600">{sub.name}</span>)}{category.subcategories.length>6&&<span className="rounded-full bg-slate-100 px-2 py-1 text-[10px] font-bold text-slate-500">+{category.subcategories.length-6}</span>}</div></div>}<div className="mt-5 flex items-center justify-between border-t border-slate-100 pt-4"><div><p className="text-[10px] text-slate-400">Loaded listings</p><strong className="text-sm text-slate-800">{category.listings.toLocaleString()}</strong></div><div className="flex items-center gap-2"><SafeLink href={`/categories/${category.slug}`} className="text-xs font-black text-emerald-700">Manage</SafeLink><span className={`rounded-full px-2 py-1 text-[10px] font-bold ${category.active?"bg-emerald-50 text-emerald-700":"bg-slate-100 text-slate-500"}`}>{category.active?"Active":"Hidden"}</span></div></div></article>)}</div>
    {categories.length===0&&<div className="rounded-xl border border-dashed border-slate-300 bg-white p-10 text-center"><p className="text-sm font-black text-slate-800">No categories available</p><p className="mt-1 text-xs text-slate-500">Create a category to start organizing marketplace listings.</p></div>}
    <Dialog open={open} onClose={()=>setOpen(false)} title="Add category" description="Create a new top-level marketplace category." footer={<><AdminButton variant="outline" onClick={()=>setOpen(false)}>Cancel</AdminButton><AdminButton disabled={busy||name.trim().length<2} onClick={()=>void create()}>{busy?"Creating…":"Create category"}</AdminButton></>}><label className="block"><span className="mb-2 block text-xs font-bold text-slate-700">Category name</span><input data-dialog-autofocus value={name} onChange={(e)=>setName(e.target.value)} className="h-11 w-full rounded-xl border border-slate-200 px-3 text-sm outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/10" placeholder="e.g. Sports & Outdoors"/></label></Dialog>
  </div>;
}
