"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card"
import { Button } from "../components/ui/button"
import { Input } from "../components/ui/input"
import { Textarea } from "../components/ui/textarea"
import { Label } from "../components/ui/label"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "../components/ui/dialog"
import { PlusCircle, BookOpen, Plus } from "lucide-react"
import { toast } from "sonner"
import axios from "axios"

interface Blog {
    _id: string
    title: string
    content: string
    author: string
    createdAt: string
    updatedAt: string
}

export default function BlogHomeScreen() {
    const [blogPosts, setBlogPosts] = useState<Blog[]>([])
    const [loadingState, setLoadingState] = useState(true)
    const [submittingState, setSubmittingState] = useState(false)
    const [dialogOpen, setDialogOpen] = useState(false)
    const [postForm, setPostForm] = useState({
        title: "",
        content: "",
        author: "",
    })
    const [refreshTrigger, setRefreshTrigger] = useState(0)

    useEffect(() => {
        const fetchBlogs = async () => {
            try {
                const response = await axios.get(`http://localhost:5000/posts`)
                console.log(response.data)
                setBlogPosts(response.data)
            } catch (error) {
                // Handle error silently
            } finally {
                setLoadingState(false)
            }
        }

        fetchBlogs()
    }, [refreshTrigger])

    const submitNewBlog = async () => {
        try {
            const response = await axios.post("http://localhost:5000/create", postForm)
            console.log("Response:", response.data)
        } catch (error) {
            console.error("Error:", error)
        }
    }

    const onFormSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        console.log(postForm)

        const { title, content, author } = postForm
        if (!title.trim() || !content.trim() || !author.trim()) {
            toast.error("Please fill in all fields")
            return
        }

        setSubmittingState(true)
        await submitNewBlog()
        setSubmittingState(false)
        setDialogOpen(false)
        setPostForm({ title: "", content: "", author: "" }) // Reset form
        setRefreshTrigger((current) => current + 1)
    }

    const updateFormField = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target
        setPostForm((previousForm) => ({
            ...previousForm,
            [name]: value,
        }))
    }

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString("en-US", {
            year: "numeric",
            month: "long",
            day: "numeric",
        })
    }

    const postCount = blogPosts?.length || 0
    const postLabel = postCount === 1 ? "post" : "posts"

    return (
        <div className="min-h-screen py-8 z-20 relative">
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Header Section */}
                <div className="text-center mb-8">
                    <h1 className="text-4xl font-bold text-white mb-2">Blogging Website</h1>
                </div>

                {/* Blog Management Section */}
                <div className="flex justify-start gap-10 items-center mb-8">
                    <div className="flex items-center gap-2">
                        <h2 className="text-2xl font-bold text-white">Discover Blogs</h2>
                    </div>

                    <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                        <DialogTrigger asChild>
                            <Button className="flex items-center gap-2 bg-black text-white border-[1px] border-white">
                                <Plus className="h-4 w-4" />
                            </Button>
                        </DialogTrigger>
                        <DialogContent className="sm:max-w-[500px] bg-white">
                            <DialogHeader>
                                <DialogTitle className="flex items-center gap-2">
                                    <PlusCircle className="h-5 w-5" />
                                    Create New Blog Post
                                </DialogTitle>
                                <DialogDescription>Share your thoughts and ideas with the community</DialogDescription>
                            </DialogHeader>

                            <form onSubmit={onFormSubmit} className="space-y-6 mt-6">
                                <div className="space-y-2">
                                    <Label htmlFor="title">Title</Label>
                                    <Input
                                        id="title"
                                        name="title"
                                        placeholder="Enter blog title"
                                        value={postForm.title}
                                        onChange={updateFormField}
                                        className="focus:outline-none focus:ring-0 focus:border-transparent"
                                        required
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="author">Author</Label>
                                    <Input
                                        id="author"
                                        name="author"
                                        placeholder="Your name"
                                        value={postForm.author}
                                        onChange={updateFormField}
                                        required
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="content">Content</Label>
                                    <Textarea
                                        id="content"
                                        name="content"
                                        placeholder="Write your blog content here..."
                                        value={postForm.content}
                                        onChange={updateFormField}
                                        rows={6}
                                        required
                                        className="resize-none"
                                    />
                                </div>

                                <div className="flex gap-3 pt-4">
                                    <Button type="submit" disabled={submittingState} className="flex-1 bg-black text-white">
                                        {submittingState ? "Publishing..." : "Publish Blog Post"}
                                    </Button>
                                    <Button
                                        type="button"
                                        variant="outline"
                                        onClick={() => setDialogOpen(false)}
                                        disabled={submittingState}
                                    >
                                        Cancel
                                    </Button>
                                </div>
                            </form>
                        </DialogContent>
                    </Dialog>
                </div>

                {/* Blog Posts Display */}
                <div className="space-y-6">
                    {loadingState ? (
                        <div className="text-center py-8">
                            <p className="mt-2 text-gray-600">Loading blogs...</p>
                        </div>
                    ) : postCount === 0 ? (
                        <Card>
                            <CardContent className="text-center py-8">
                                <BookOpen className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                                <h3 className="text-lg font-medium text-gray-900 mb-2">No blog posts yet</h3>
                                <p className="text-gray-600">Be the first to share your thoughts!</p>
                            </CardContent>
                        </Card>
                    ) : (
                        <div className="grid gap-6">
                            {blogPosts.map((post) => (
                                <Card key={post._id} className="hover:shadow-lg transition-shadow bg-white rounded-[1px]">
                                    <CardHeader>
                                        <CardTitle className="text-xl">Title: {post.title}</CardTitle>
                                        <CardDescription className="flex items-center gap-4 text-sm">
                                            <span className="flex items-center gap-1 text-blue-500">Author: {post.author}</span>
                                        </CardDescription>
                                    </CardHeader>
                                    <CardContent>
                                        <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">{post.content}</p>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}
