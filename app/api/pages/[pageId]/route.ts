import { type NextRequest, NextResponse } from "next/server"
import { updatePage, getPageById } from "@/lib/auth"

export async function PUT(request: NextRequest, { params }: { params: { pageId: string } }) {
  try {
    const { pageId } = params
    const updates = await request.json()

    // Validate that the page exists
    const existingPage = getPageById(pageId)
    if (!existingPage) {
      return NextResponse.json({ error: "Page not found" }, { status: 404 })
    }

    // Update the page
    const success = updatePage(pageId, {
      ...updates,
      updatedAt: new Date(),
    })

    if (success) {
      const updatedPage = getPageById(pageId)
      return NextResponse.json({
        success: true,
        page: updatedPage,
        message: "Page updated successfully",
      })
    } else {
      return NextResponse.json({ error: "Failed to update page" }, { status: 500 })
    }
  } catch (error) {
    console.error("Error updating page:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function GET(request: NextRequest, { params }: { params: { pageId: string } }) {
  try {
    const { pageId } = params
    const page = getPageById(pageId)

    if (!page) {
      return NextResponse.json({ error: "Page not found" }, { status: 404 })
    }

    return NextResponse.json({ page })
  } catch (error) {
    console.error("Error fetching page:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
