export const CATEGORY_CATALOG_TEMPLATE = `field_key,field_label,depends_on,parent_value,option_value,option_label,required,filterable,allow_custom,lazy,unit,sort_order,active
brand,Brand,,,hp,HP,true,true,true,true,,10,true
brand,Brand,,,samsung,Samsung,true,true,true,true,,20,true
model,Model,brand,hp,pavilion-15,HP Pavilion 15,true,true,true,true,,10,true
model,Model,brand,hp,elitebook-840,HP EliteBook 840,true,true,true,true,,20,true
model,Model,brand,samsung,galaxy-s24,Samsung Galaxy S24,true,true,true,true,,10,true
model,Model,brand,samsung,galaxy-s25,Samsung Galaxy S25,true,true,true,true,,20,true
ram,RAM,model,pavilion-15,8gb,8 GB,false,true,true,true,GB,10,true
ram,RAM,model,pavilion-15,16gb,16 GB,false,true,true,true,GB,20,true
storage,Storage,model,galaxy-s24,128gb,128 GB,false,true,true,true,GB,10,true
storage,Storage,model,galaxy-s24,256gb,256 GB,false,true,true,true,GB,20,true
`;

export function downloadCategoryCatalogTemplate() {
  const blob = new Blob([CATEGORY_CATALOG_TEMPLATE], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = "marketlift-category-catalog-template.csv";
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  URL.revokeObjectURL(url);
}
