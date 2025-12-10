'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Shield, Users, Ban, Trash2, Search, RefreshCw, ArrowLeft, UserCheck, UserX, AlertTriangle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { useAuth } from '@/contexts/auth-context'
import { toast } from 'sonner'

interface User {
    id: string
    email: string
    name: string
    role: string
    created_at: string
    banned: boolean
    email_confirmed: boolean
    last_sign_in: string | null
}

export default function AdminUsersPage() {
    const router = useRouter()
    const { user, session, isAdmin } = useAuth()
    const [users, setUsers] = useState<User[]>([])
    const [filteredUsers, setFilteredUsers] = useState<User[]>([])
    const [searchQuery, setSearchQuery] = useState('')
    const [loading, setLoading] = useState(true)
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
    const [userToDelete, setUserToDelete] = useState<User | null>(null)

    useEffect(() => {
        if (!isAdmin) {
            router.push('/auth/login')
            return
        }
        loadUsers()
    }, [isAdmin, router])

    useEffect(() => {
        // Filter users based on search query
        if (searchQuery) {
            const filtered = users.filter(u =>
                u.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
                u.name.toLowerCase().includes(searchQuery.toLowerCase())
            )
            setFilteredUsers(filtered)
        } else {
            setFilteredUsers(users)
        }
    }, [searchQuery, users])

    const loadUsers = async () => {
        try {
            setLoading(true)
            const token = session?.access_token

            const response = await fetch('/api/admin/users', {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            })

            if (!response.ok) {
                throw new Error('Failed to fetch users')
            }

            const data = await response.json()
            setUsers(data.users)
            setFilteredUsers(data.users)
        } catch (error) {
            console.error('Error loading users:', error)
            toast.error('Failed to load users')
        } finally {
            setLoading(false)
        }
    }

    const handleBanToggle = async (userId: string, currentlyBanned: boolean) => {
        try {
            const token = session?.access_token

            const response = await fetch(`/api/admin/users/${userId}/ban`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ banned: !currentlyBanned })
            })

            if (!response.ok) {
                throw new Error('Failed to update ban status')
            }

            toast.success(currentlyBanned ? 'User unbanned successfully' : 'User banned successfully')
            loadUsers()
        } catch (error) {
            console.error('Error toggling ban:', error)
            toast.error('Failed to update ban status')
        }
    }

    const handleDeleteUser = async () => {
        if (!userToDelete) return

        try {
            const token = session?.access_token

            const response = await fetch(`/api/admin/users/${userToDelete.id}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            })

            if (!response.ok) {
                throw new Error('Failed to delete user')
            }

            toast.success('User deleted successfully')
            setDeleteDialogOpen(false)
            setUserToDelete(null)
            loadUsers()
        } catch (error) {
            console.error('Error deleting user:', error)
            toast.error('Failed to delete user')
        }
    }

    const stats = {
        total: users.length,
        active: users.filter(u => !u.banned).length,
        banned: users.filter(u => u.banned).length,
        admins: users.filter(u => u.role === 'admin').length
    }

    if (loading) {
        return (
            <div className="min-h-screen bg-background flex items-center justify-center">
                <div className="text-center">
                    <RefreshCw className="w-8 h-8 animate-spin mx-auto mb-4" />
                    <p>Loading users...</p>
                </div>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-background">
            {/* Header */}
            <header className="border-b bg-card">
                <div className="container mx-auto px-4 py-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                            <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => router.push('/admin/dashboard')}
                            >
                                <ArrowLeft className="w-5 h-5" />
                            </Button>
                            <div>
                                <h1 className="text-2xl font-bold flex items-center">
                                    <Users className="w-6 h-6 mr-2" />
                                    User Management
                                </h1>
                                <p className="text-sm text-muted-foreground">Manage user accounts and permissions</p>
                            </div>
                        </div>
                        <Button onClick={loadUsers} variant="outline">
                            <RefreshCw className="w-4 h-4 mr-2" />
                            Refresh
                        </Button>
                    </div>
                </div>
            </header>

            <main className="container mx-auto px-4 py-8">
                {/* Statistics */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
                    <Card>
                        <CardHeader className="pb-3">
                            <CardTitle className="text-sm font-medium text-muted-foreground">Total Users</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-3xl font-bold">{stats.total}</div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="pb-3">
                            <CardTitle className="text-sm font-medium text-muted-foreground">Active Users</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-3xl font-bold text-green-600">{stats.active}</div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="pb-3">
                            <CardTitle className="text-sm font-medium text-muted-foreground">Banned Users</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-3xl font-bold text-red-600">{stats.banned}</div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="pb-3">
                            <CardTitle className="text-sm font-medium text-muted-foreground">Administrators</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-3xl font-bold text-purple-600">{stats.admins}</div>
                        </CardContent>
                    </Card>
                </div>

                {/* Search */}
                <Card className="mb-6">
                    <CardContent className="pt-6">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                            <Input
                                placeholder="Search by email or name..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="pl-10"
                            />
                        </div>
                    </CardContent>
                </Card>

                {/* Users Table */}
                <Card>
                    <CardHeader>
                        <CardTitle>All Users ({filteredUsers.length})</CardTitle>
                        <CardDescription>Manage user accounts, ban users, or delete accounts</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead>
                                    <tr className="border-b">
                                        <th className="text-left py-3 px-4">Email</th>
                                        <th className="text-left py-3 px-4">Name</th>
                                        <th className="text-left py-3 px-4">Role</th>
                                        <th className="text-left py-3 px-4">Status</th>
                                        <th className="text-left py-3 px-4">Created</th>
                                        <th className="text-right py-3 px-4">Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filteredUsers.map((u) => (
                                        <tr key={u.id} className="border-b hover:bg-muted/50">
                                            <td className="py-3 px-4 font-medium">{u.email}</td>
                                            <td className="py-3 px-4">{u.name}</td>
                                            <td className="py-3 px-4">
                                                <Badge variant={u.role === 'admin' ? 'default' : 'secondary'}>
                                                    {u.role === 'admin' ? (
                                                        <><Shield className="w-3 h-3 mr-1" /> Admin</>
                                                    ) : (
                                                        'User'
                                                    )}
                                                </Badge>
                                            </td>
                                            <td className="py-3 px-4">
                                                {u.banned ? (
                                                    <Badge variant="destructive">
                                                        <UserX className="w-3 h-3 mr-1" /> Banned
                                                    </Badge>
                                                ) : (
                                                    <Badge variant="outline" className="text-green-600 border-green-600">
                                                        <UserCheck className="w-3 h-3 mr-1" /> Active
                                                    </Badge>
                                                )}
                                            </td>
                                            <td className="py-3 px-4 text-sm text-muted-foreground">
                                                {new Date(u.created_at).toLocaleDateString()}
                                            </td>
                                            <td className="py-3 px-4">
                                                <div className="flex items-center justify-end space-x-2">
                                                    <Button
                                                        size="sm"
                                                        variant={u.banned ? "outline" : "destructive"}
                                                        onClick={() => handleBanToggle(u.id, u.banned)}
                                                        disabled={u.role === 'admin'}
                                                    >
                                                        <Ban className="w-3 h-3 mr-1" />
                                                        {u.banned ? 'Unban' : 'Ban'}
                                                    </Button>
                                                    <Button
                                                        size="sm"
                                                        variant="destructive"
                                                        onClick={() => {
                                                            setUserToDelete(u)
                                                            setDeleteDialogOpen(true)
                                                        }}
                                                        disabled={u.role === 'admin' || u.id === user?.id}
                                                    >
                                                        <Trash2 className="w-3 h-3 mr-1" />
                                                        Delete
                                                    </Button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </CardContent>
                </Card>
            </main>

            {/* Delete Confirmation Dialog */}
            <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle className="flex items-center">
                            <AlertTriangle className="w-5 h-5 mr-2 text-red-600" />
                            Delete User Account
                        </AlertDialogTitle>
                        <AlertDialogDescription>
                            Are you sure you want to delete <strong>{userToDelete?.email}</strong>?
                            <br /><br />
                            This action cannot be undone. This will permanently delete the user account and all associated content.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={handleDeleteUser}
                            className="bg-red-600 hover:bg-red-700"
                        >
                            Delete User
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    )
}
