import { NextResponse } from "next/server";
import { chromium } from "playwright-core";
import { headers } from "next/headers";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const resumeId = searchParams.get("resumeId");

  if (!resumeId) {
    return NextResponse.json({ error: "Missing resumeId" }, { status: 400 });
  }

  try {
    const headersList = await headers();
    const host = headersList.get("host") || "localhost:3000";
    const protocol = host.includes("localhost") ? "http" : "https";
    
    // Launch headless browser
    const browser = await chromium.launch({ args: ['--no-sandbox', '--disable-setuid-sandbox'] });
    const page = await browser.newPage();
    
    // Navigate to a special print-only layout route for the GCV
    await page.goto(`${protocol}://${host}/en/gcv/export-view/${resumeId}`, { waitUntil: "networkidle" });

    // Take full page screenshot
    const screenshotBuffer = await page.screenshot({ fullPage: true, type: 'png' });
    
    await browser.close();

    return new NextResponse(screenshotBuffer as any, {
      headers: {
        "Content-Type": "image/png",
        "Content-Disposition": `attachment; filename="gcv-${resumeId}.png"`,
      },
    });
  } catch (error) {
    console.error("Playwright Export Error:", error);
    return NextResponse.json({ error: "Export failed" }, { status: 500 });
  }
}
