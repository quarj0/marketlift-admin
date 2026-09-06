import { test, expect } from "@playwright/test";
import { createRequire } from "node:module";
const require = createRequire(`${process.cwd()}/package.json`);

test("admin pagination and search reach records beyond the first 200", async ({ page }) => {
  const calls: {offset:number;q:string}[]=[];
  await page.route("http://127.0.0.1:8123/**",async route=>{
    const path=new URL(route.request().url()).pathname;
    const headers={"Access-Control-Allow-Origin":"http://127.0.0.1:3102","Access-Control-Allow-Credentials":"true","Access-Control-Allow-Headers":"content-type,x-csrftoken","Access-Control-Allow-Methods":"GET,POST,OPTIONS"};
    let data: unknown={};
    if(path.includes("/session/")) data={authenticated:true,user:{id:"admin",name:"Test Admin",email:"admin@example.invalid",isStaff:true,isSuperuser:true,adminRole:"admin"}};
    else if(path.includes("/csrf/")) data={csrfToken:"test"};
    else if(path.includes("/graphql/") && route.request().method()==="POST") {
      const body=route.request().postDataJSON();
      if(body.query.includes("adminRecordPage")) {
        calls.push(body.variables);
        const ids=body.variables.q ? [259] : Array.from({length:25},(_,i)=>i+body.variables.offset);
        data={data:{adminRecordPage:{totalCount:body.variables.q?1:260,adminUsers:ids.map(id=>({id:`user-${id}`,name:`Customer ${id}`,email:`user${id}@example.invalid`,active:true,staff:false,suspended:false,joinedAt:"2026-09-01T00:00:00Z",location:{city:"São Paulo",countryCode:"BR",stateCode:"SP"}}))}}};
      } else data={data:{adminDashboard:{counts:{totalUsers:260},revenue:{today:0,thisMonth:0,total:0,subscriptionTotal:0,promotionTotal:0}},notifications:[],unreadNotificationCount:0}};
    }
    await route.fulfill({status:200,contentType:"application/json",headers,body:JSON.stringify(data)});
  });
  await page.goto("/users");
  await expect(page.getByText("Customer 0",{exact:true})).toBeVisible();
  await expect(page.getByRole("navigation",{name:"Table pagination"})).toContainText("260 results");
  await page.getByRole("button",{name:"Go to next page"}).click();
  await expect(page.getByText("Customer 25",{exact:true})).toBeVisible();
  expect(calls.some(call=>call.offset===25)).toBe(true);
  await page.getByRole("searchbox").fill("Customer 259");
  await expect(page.getByText("Customer 259",{exact:true})).toBeVisible();
  expect(calls.at(-1)?.q).toBe("Customer 259");
  expect(calls.at(-1)?.offset).toBe(0);
  await expect(page).toHaveURL(/q=Customer\+259/);
  await page.reload();
  await expect(page.getByRole("searchbox")).toHaveValue("Customer 259");
  await expect(page.getByText("Customer 259",{exact:true})).toBeVisible();
  await page.addScriptTag({path:require.resolve("axe-core/axe.min.js")});
  const violations=await page.evaluate(async()=>{
    const axe=(window as unknown as {axe:{run:(context:Document,options:unknown)=>Promise<{violations:unknown[]}>}}).axe;
    return (await axe.run(document,{runOnly:{type:"tag",values:["wcag2a","wcag2aa","wcag21aa","wcag22aa"]}})).violations;
  });
  expect(violations).toEqual([]);
});

test("direct Brazilian listing detail includes its currency and related context", async ({page}) => {
  const listing = {id:"listing-one",slug:"samsung-phone",title:"Samsung phone",description:"A phone",price:1234.5,category:"phones",categoryName:"Phones",condition:"used",location:{countryCode:"BR",state:"São Paulo",stateCode:"SP",city:"São Paulo",district:null},images:[],seller:{id:"seller-one",name:"Example seller"},createdAt:"2026-09-01T00:00:00Z",status:"under_review",sellerDeletedAt:null,views:0,favorites:0,inquiries:0,featured:false,urgent:false,reportCount:1};
  const report = {id:"report-one",reference:"RPT-EXAMPLE",targetType:"listing",targetId:listing.id,targetLabel:listing.title,reason:"other",statement:"Review this item",priority:"medium",status:"open",reporterName:"Buyer",internalNote:"Staff context",createdAt:listing.createdAt};
  await page.route("http://127.0.0.1:8123/**",async route=>{
    const path=new URL(route.request().url()).pathname;
    const headers={"Access-Control-Allow-Origin":"http://127.0.0.1:3102","Access-Control-Allow-Credentials":"true","Access-Control-Allow-Headers":"content-type,x-csrftoken","Access-Control-Allow-Methods":"GET,POST,OPTIONS"};
    let data:unknown={};
    if(path.includes("/session/")) data={authenticated:true,user:{id:"admin",name:"Test Admin",email:"admin@example.invalid",isStaff:true,isSuperuser:true,adminRole:"admin"}};
    else if(path.includes("/csrf/")) data={csrfToken:"test"};
    else if(path.includes("/graphql/") && route.request().method()==="POST") {
      const {query,variables}=route.request().postDataJSON();
      if(query.includes("adminRecordPage")) {
        expect(variables.recordId).toBe(listing.id);
        data={data:{adminRecordPage:{totalCount:1,adminListings:[listing],reports:[report],moderationQueue:[{id:"case-one",status:"review",source:"report",reviewReason:"Check the device model",decisionReason:"",openedAt:listing.createdAt,listing:{id:listing.id}}]}}};
      } else if(query.includes("AdminListingDetail")) data={data:{adminListing:listing}};
      else data={data:{adminMarkets:[],adminSellerPlanMarketPrices:[],adminPromotionMarketPrices:[],notifications:[],unreadNotificationCount:0,adminDashboard:{counts:{},revenue:{}}}};
    }
    await route.fulfill({status:200,contentType:"application/json",headers,body:JSON.stringify(data)});
  });
  await page.goto("/listings/listing-one");
  await expect(page.getByRole("heading",{name:"Samsung phone",exact:true})).toBeVisible();
  await expect(page.getByText(/R\$\s*1,234\.50/)).toBeVisible();
  await expect(page.getByText("Check the device model",{exact:true})).toBeVisible();
  await expect(page.getByRole("link",{name:/RPT-EXAMPLE/})).toBeVisible();
});
