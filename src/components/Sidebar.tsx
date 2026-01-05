'use client';

import { createClient } from '@/lib/supabase/client';
import { useEffect, useState, useRef } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import type { User } from '@supabase/supabase-js';
import { SidebarSkeleton } from './skeletons/SidebarSkeleton';
import { SidebarListItemSkeleton } from './skeletons/SidebarListItemSkeleton';
import { PersonWithNote } from '@/lib/supabase/people';
import { PeopleListItem } from './people/PeopleListItem';
import { AddPersonModal } from './people/AddPersonModal';
import { IconButton } from './IconButton';
import { showSuccessToast, showErrorToast } from '@/lib/toast';

// Icon components defined outside the main component
const UsersIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
  </svg>
);

const HomeIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
  </svg>
);

const SettingsIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
  </svg>
);

// Helper function to get user initials
const getUserInitials = (user: User): string => {
  // Try to get initials from user_metadata.full_name first
  if (user.user_metadata?.full_name) {
    const trimmed = user.user_metadata.full_name.trim();
    if (trimmed.length > 0) {
      return trimmed[0].toUpperCase();
    }
  }
  
  // Fall back to email
  if (user.email) {
    const emailParts = user.email.split('@')[0];
    if (emailParts.length > 0) {
      return emailParts[0].toUpperCase();
    }
  }
  
  return 'U';
};

// Helper function to get user display name
const getUserDisplayName = (user: User): string => {
  // Try to get full name from user_metadata
  if (user.user_metadata?.full_name) {
    return user.user_metadata.full_name;
  }
  
  // Fall back to email
  if (user.email) {
    return user.email;
  }
  
  return 'User';
};

interface SidebarProps {
  initialUser?: User | null;
}

export function Sidebar({ initialUser = null }: SidebarProps = {}) {
  const [user, setUser] = useState<User | null>(initialUser);
  const [loading, setLoading] = useState(!initialUser);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const userMenuRef = useRef<HTMLDivElement>(null);
  const pathname = usePathname();
  const router = useRouter();
  
  // Touch device detection for hover state handling
  const isTouchDevice = useRef(false);
  const isTouching = useRef(false);
  
  // Detect touch device on mount
  useEffect(() => {
    isTouchDevice.current = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
  }, []);
  
  // Helper function to reset hover state (clear background)
  const resetHoverState = (element: HTMLElement) => {
    element.style.backgroundColor = 'transparent';
  };
  
  // People section state
  const [people, setPeople] = useState<PersonWithNote[]>([]);
  const [favorites, setFavorites] = useState<PersonWithNote[]>([]);
  const [peopleLoading, setPeopleLoading] = useState(true);
  // Load expanded state from localStorage, default to true (expanded) for both
  const [isPeopleExpanded, setIsPeopleExpandedState] = useState(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('sidebar-people-expanded');
      return saved !== null ? saved === 'true' : true;
    }
    return true;
  });
  const [isFavoritesExpanded, setIsFavoritesExpandedState] = useState(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('sidebar-favorites-expanded');
      return saved !== null ? saved === 'true' : true;
    }
    return true;
  });
  const [peopleSearchQuery, setPeopleSearchQuery] = useState('');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);

  // Wrapper functions to persist state to localStorage
  const setIsPeopleExpanded = (value: boolean | ((prev: boolean) => boolean)) => {
    setIsPeopleExpandedState((prev) => {
      const newValue = typeof value === 'function' ? value(prev) : value;
      if (typeof window !== 'undefined') {
        localStorage.setItem('sidebar-people-expanded', String(newValue));
      }
      return newValue;
    });
  };

  const setIsFavoritesExpanded = (value: boolean | ((prev: boolean) => boolean)) => {
    setIsFavoritesExpandedState((prev) => {
      const newValue = typeof value === 'function' ? value(prev) : value;
      if (typeof window !== 'undefined') {
        localStorage.setItem('sidebar-favorites-expanded', String(newValue));
      }
      return newValue;
    });
  };

  useEffect(() => {
    const supabase = createClient();

    // If we have an initial user, we can skip the initial check
    if (initialUser) {
      setLoading(false);
    } else {
      // Get initial session
      supabase.auth.getUser().then(({ data: { user } }) => {
        setUser(user);
        setLoading(false);
      });
    }

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, [initialUser]);

  // Close user menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
        setIsUserMenuOpen(false);
      }
    };

    if (isUserMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isUserMenuOpen]);

  // Fetch people data
  useEffect(() => {
    if (!user) return;

    const fetchPeople = async () => {
      setPeopleLoading(true);
      try {
        const [peopleRes, favoritesRes] = await Promise.all([
          fetch('/api/people'),
          fetch('/api/people?favorites=true'),
        ]);

        if (peopleRes.ok) {
          const peopleData = await peopleRes.json();
          setPeople(peopleData.people || []);
        }

        if (favoritesRes.ok) {
          const favoritesData = await favoritesRes.json();
          setFavorites(favoritesData.people || []);
        }
      } catch (error) {
        console.error('Error fetching people:', error);
      } finally {
        setPeopleLoading(false);
      }
    };

    fetchPeople();
  }, [user]);

  // Logout handler
  const handleLogout = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push('/');
    router.refresh();
  };

  // Handle delete person
  const handleDeletePerson = async (personId: string) => {
    setDeleteLoading(true);
    try {
      const response = await fetch(`/api/people/${personId}`, {
        method: 'DELETE',
      });

      const result = await response.json();

      if (response.ok && result.success) {
        setPeople((prev) => prev.filter((p) => p.id !== personId));
        setFavorites((prev) => prev.filter((p) => p.id !== personId));
        showSuccessToast('Person deleted');
        router.refresh();
      } else {
        throw new Error(result.error || 'Failed to delete person');
      }
    } catch (error) {
      console.error('Error deleting person:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to delete person';
      showErrorToast(errorMessage);
    } finally {
      setDeleteLoading(false);
    }
  };

  // Handle toggle favorite
  // This function is called AFTER the API call has already been made in PeopleListItem
  // So we just need to update the state, not make another API call
  const handleToggleFavorite = async (personId: string, isFavorite: boolean) => {
    // Update people list
    setPeople((prev) => {
      const updated = prev.map((p) => 
        p.id === personId 
          ? { ...p, is_favorite: isFavorite } 
          : p
      );
      return updated;
    });

    // Refetch both people and favorites to ensure state is in sync with database
    try {
      const [peopleRes, favoritesRes] = await Promise.all([
        fetch('/api/people'),
        fetch('/api/people?favorites=true'),
      ]);
      
      if (peopleRes.ok) {
        const peopleData = await peopleRes.json();
        setPeople(peopleData.people || []);
      }
      
      if (favoritesRes.ok) {
        const favoritesData = await favoritesRes.json();
        setFavorites(favoritesData.people || []);
      }
    } catch (fetchError) {
      console.error('Error refetching favorites:', fetchError);
      // Fallback: manually update favorites list if refetch fails
      if (isFavorite) {
        const personWithNote = people.find((p) => p.id === personId);
        if (personWithNote) {
          setFavorites((prev) => {
            if (prev.some((p) => p.id === personId)) {
              return prev.map((p) => (p.id === personId ? { ...personWithNote, is_favorite: true } : p));
            }
            return [...prev, { ...personWithNote, is_favorite: true }];
          });
        }
      } else {
        setFavorites((prev) => prev.filter((p) => p.id !== personId));
      }
    }
  };

  // Handle person added
  const handlePersonAdded = async () => {
    // Refresh people list
    try {
      const [peopleRes, favoritesRes] = await Promise.all([
        fetch('/api/people'),
        fetch('/api/people?favorites=true'),
      ]);

      if (peopleRes.ok) {
        const peopleData = await peopleRes.json();
        setPeople(peopleData.people || []);
      }

      if (favoritesRes.ok) {
        const favoritesData = await favoritesRes.json();
        setFavorites(favoritesData.people || []);
      }
    } catch (error) {
      console.error('Error refreshing people:', error);
    }
  };

  // Filter people based on search
  const filteredPeople = people.filter((person) => {
    const query = peopleSearchQuery.toLowerCase().trim();
    if (!query) return true;
    return person.name.toLowerCase().includes(query);
  });


  // Show skeleton while loading
  if (loading) {
    return <SidebarSkeleton />;
  }

  // Don't render if not logged in
  if (!user) {
    return null;
  }

  const isActive = (path: string) => pathname === path;

  const sidebarContent = (
    <div className="h-full flex flex-col">
      {/* Sticky Header Section */}
      <div className="flex-shrink-0 border-b" style={{ borderColor: 'var(--border-color)', paddingTop: '1.5rem', paddingBottom: '1.5rem' }}>
        {/* Header with branding */}
        <div className="flex items-center py-4 px-4">
          <Link href="/home" className="flex items-center gap-3 px-3 hover:opacity-80 transition-opacity">
            {/* Avatar placeholder with "R" - aligned with menu icons */}
            <div className="w-6 h-6 rounded-md flex items-center justify-center flex-shrink-0" style={{ background: 'linear-gradient(135deg, #a855f7 0%, #7c3aed 100%)' }}>
              <span className="text-white font-medium text-sm">R</span>
            </div>
            <span className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>Refracty</span>
          </Link>
        </div>

        {/* User and Home - Sticky */}
        <div className="px-4 space-y-1">
          {/* User */}
          <div className="relative" ref={userMenuRef}>
            <button
              onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
              className="group relative flex items-center gap-3 px-3 py-2 rounded-md sidebar-link transition-colors w-full"
            >
{user.user_metadata?.avatar_url ? (
                <img
                  src={user.user_metadata.avatar_url}
                  alt="User avatar"
                  className="w-5 h-5 rounded-full object-cover flex-shrink-0"
                />
              ) : (
                <div className="w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0" style={{ background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)' }}>
                  <span className="text-white text-[9px] font-medium">{getUserInitials(user)}</span>
                </div>
              )}
              <span className="flex-1 text-sm text-left truncate font-semibold" style={{ color: 'var(--text-primary)' }}>
                {getUserDisplayName(user)}
              </span>
            </button>

            {isUserMenuOpen && (
              <div
                className="absolute left-0 mt-1 w-48 rounded-md shadow-lg z-50 border"
                style={{
                  backgroundColor: 'var(--bg-primary)',
                  borderColor: 'var(--border-color)',
                }}
              >
                <div className="py-1">
                  {/* Settings */}
                  <Link
                    href="/settings"
                    onClick={() => setIsUserMenuOpen(false)}
                    className="flex items-center gap-3 px-4 py-2 text-sm hover:bg-tertiary transition-colors"
                    style={{
                      color: 'var(--text-primary)',
                      backgroundColor: 'transparent',
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = 'var(--bg-tertiary)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = 'transparent';
                    }}
                  >
                    <SettingsIcon className="w-4 h-4 flex-shrink-0" />
                    <span>Settings</span>
                  </Link>

                  {/* Logout */}
                  <button
                    onClick={handleLogout}
                    className="w-full text-left flex items-center gap-3 px-4 py-2 text-sm hover:bg-tertiary transition-colors"
                    style={{
                      color: '#ef4444',
                      backgroundColor: 'transparent',
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = 'var(--bg-tertiary)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = 'transparent';
                    }}
                  >
                    <svg
                      className="w-4 h-4 flex-shrink-0"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                      />
                    </svg>
                    <span>Logout</span>
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Home */}
          <Link
            href="/home"
            className="flex items-center gap-3 px-3 py-2 rounded-md text-sm font-semibold sidebar-link transition-colors"
          >
            <HomeIcon className="w-5 h-5 flex-shrink-0" />
            <span>Home</span>
          </Link>
        </div>
      </div>

      {/* Scrollable Navigation items */}
      <nav className="flex-1 overflow-y-auto px-4 pt-4 space-y-3 scrollbar-hide" style={{ paddingBottom: '10rem' }}>

        {/* Favorites Section */}
        <div className="mt-1">
          {/* Favorites Header */}
          <div className="group relative flex items-center gap-3 px-3 py-2 rounded-md transition-colors"
            onMouseEnter={(e) => {
              // Don't apply hover styles on touch devices or during touch interactions
              if (isTouchDevice.current || isTouching.current) {
                return;
              }
              e.currentTarget.style.backgroundColor = 'var(--bg-tertiary)';
            }}
            onMouseLeave={(e) => {
              // Don't handle mouse leave on touch devices
              if (isTouchDevice.current) {
                return;
              }
              e.currentTarget.style.backgroundColor = 'transparent';
            }}
            onTouchStart={(e) => {
              isTouching.current = true;
              // Clear any existing hover state immediately
              resetHoverState(e.currentTarget);
            }}
            onTouchEnd={(e) => {
              const element = e.currentTarget;
              // Immediately clear any hover state that might have been applied
              resetHoverState(element);
              // Reset touching flag after a short delay to allow click to fire
              setTimeout(() => {
                isTouching.current = false;
              }, 100);
              // Also clear hover state after delays to catch any delayed hover states from iOS
              setTimeout(() => {
                resetHoverState(element);
              }, 50);
              setTimeout(() => {
                resetHoverState(element);
              }, 200);
              setTimeout(() => {
                resetHoverState(element);
              }, 500);
            }}
          >
            <button
              onClick={() => setIsFavoritesExpanded(!isFavoritesExpanded)}
              className="flex items-center gap-2 flex-1 text-sm font-semibold"
              style={{ color: 'var(--text-primary)' }}
            >
              <svg
                className={`w-4 h-4 transition-transform ${isFavoritesExpanded ? 'rotate-90' : ''}`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
              <span>Favorites</span>
              <span className="text-xs" style={{ color: 'var(--text-tertiary)' }}>
                {favorites.length}
              </span>
            </button>
          </div>

          {/* Favorites List */}
          {isFavoritesExpanded && (
            <div className="space-y-0.5">
              {peopleLoading ? (
                <>
                  <SidebarListItemSkeleton />
                  <SidebarListItemSkeleton />
                  <SidebarListItemSkeleton />
                </>
              ) : favorites.length === 0 ? (
                <div className="px-3 py-2 text-xs" style={{ color: 'var(--text-tertiary)' }}>
                  No favorites yet
                </div>
              ) : (
                favorites.map((person) => (
                  <PeopleListItem
                    key={person.id}
                    person={person}
                    onDelete={handleDeletePerson}
                    onToggleFavorite={handleToggleFavorite}
                    loading={deleteLoading}
                  />
                ))
              )}
            </div>
          )}
        </div>

        {/* People Section */}
        <div className="mt-6">
          {/* People Header */}
          <div className="group relative flex items-center gap-3 px-3 py-2 rounded-md transition-colors"
            onMouseEnter={(e) => {
              // Don't apply hover styles on touch devices or during touch interactions
              if (isTouchDevice.current || isTouching.current) {
                return;
              }
              e.currentTarget.style.backgroundColor = 'var(--bg-tertiary)';
            }}
            onMouseLeave={(e) => {
              // Don't handle mouse leave on touch devices
              if (isTouchDevice.current) {
                return;
              }
              e.currentTarget.style.backgroundColor = 'transparent';
            }}
            onTouchStart={(e) => {
              isTouching.current = true;
              // Clear any existing hover state immediately
              resetHoverState(e.currentTarget);
            }}
            onTouchEnd={(e) => {
              const element = e.currentTarget;
              // Immediately clear any hover state that might have been applied
              resetHoverState(element);
              // Reset touching flag after a short delay to allow click to fire
              setTimeout(() => {
                isTouching.current = false;
              }, 100);
              // Also clear hover state after delays to catch any delayed hover states from iOS
              setTimeout(() => {
                resetHoverState(element);
              }, 50);
              setTimeout(() => {
                resetHoverState(element);
              }, 200);
              setTimeout(() => {
                resetHoverState(element);
              }, 500);
            }}
          >
            <button
              onClick={() => setIsPeopleExpanded(!isPeopleExpanded)}
              className="flex items-center gap-2 flex-1 text-sm font-semibold"
              style={{ color: 'var(--text-primary)' }}
            >
              <svg
                className={`w-4 h-4 transition-transform ${isPeopleExpanded ? 'rotate-90' : ''}`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
              <span>People</span>
              <span className="text-xs" style={{ color: 'var(--text-tertiary)' }}>
                {people.length}
              </span>
            </button>
            <IconButton
              variant="group-hover"
              size="sm"
              onClick={(e) => {
                e.stopPropagation();
                setIsAddModalOpen(true);
              }}
              aria-label="Add person"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
            </IconButton>
          </div>

          {/* People Search */}
          {isPeopleExpanded && (
            <div className="px-3 mt-2 mb-2">
              <input
                type="search"
                placeholder="Search people..."
                value={peopleSearchQuery}
                onChange={(e) => setPeopleSearchQuery(e.target.value)}
                className="w-full px-2 py-1.5 text-xs border rounded-md focus:outline-none focus:ring-1 focus:ring-primary"
                style={{
                  backgroundColor: 'var(--bg-primary)',
                  borderColor: 'var(--border-color)',
                  color: 'var(--text-primary)',
                }}
              />
            </div>
          )}

          {/* People List */}
          {isPeopleExpanded && (
            <div className="space-y-0.5">
              {peopleLoading ? (
                <>
                  <SidebarListItemSkeleton />
                  <SidebarListItemSkeleton />
                  <SidebarListItemSkeleton />
                </>
              ) : filteredPeople.length === 0 ? (
                <div className="px-3 py-2 text-xs" style={{ color: 'var(--text-tertiary)' }}>
                  {peopleSearchQuery ? 'No matches' : 'No people yet'}
                </div>
              ) : (
                filteredPeople.map((person) => (
                  <PeopleListItem
                    key={person.id}
                    person={person}
                    onDelete={handleDeletePerson}
                    onToggleFavorite={handleToggleFavorite}
                    loading={deleteLoading}
                  />
                ))
              )}
            </div>
          )}
        </div>
      </nav>

      {/* Add Person Modal */}
      <AddPersonModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onPersonAdded={handlePersonAdded}
      />
    </div>
  );

  return (
    <aside className="hidden md:block flex-shrink-0 h-full w-56 sidebar-bg border-r">
      {sidebarContent}
    </aside>
  );
}

// Export the content separately for use in drawer
export function SidebarContent({ initialUser = null }: SidebarProps = {}) {
  const [user, setUser] = useState<User | null>(initialUser);
  const [loading, setLoading] = useState(!initialUser);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const userMenuRef = useRef<HTMLDivElement>(null);
  const pathname = usePathname();
  const router = useRouter();
  
  // Touch device detection for hover state handling
  const isTouchDevice = useRef(false);
  const isTouching = useRef(false);
  
  // Detect touch device on mount
  useEffect(() => {
    isTouchDevice.current = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
  }, []);
  
  // Helper function to reset hover state (clear background)
  const resetHoverState = (element: HTMLElement) => {
    element.style.backgroundColor = 'transparent';
  };
  
  // People section state
  const [people, setPeople] = useState<PersonWithNote[]>([]);
  const [favorites, setFavorites] = useState<PersonWithNote[]>([]);
  const [peopleLoading, setPeopleLoading] = useState(true);
  // Load expanded state from localStorage, default to true (expanded) for both
  const [isPeopleExpanded, setIsPeopleExpandedState] = useState(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('sidebar-people-expanded');
      return saved !== null ? saved === 'true' : true;
    }
    return true;
  });
  const [isFavoritesExpanded, setIsFavoritesExpandedState] = useState(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('sidebar-favorites-expanded');
      return saved !== null ? saved === 'true' : true;
    }
    return true;
  });
  const [peopleSearchQuery, setPeopleSearchQuery] = useState('');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);

  // Wrapper functions to persist state to localStorage
  const setIsPeopleExpanded = (value: boolean | ((prev: boolean) => boolean)) => {
    setIsPeopleExpandedState((prev) => {
      const newValue = typeof value === 'function' ? value(prev) : value;
      if (typeof window !== 'undefined') {
        localStorage.setItem('sidebar-people-expanded', String(newValue));
      }
      return newValue;
    });
  };

  const setIsFavoritesExpanded = (value: boolean | ((prev: boolean) => boolean)) => {
    setIsFavoritesExpandedState((prev) => {
      const newValue = typeof value === 'function' ? value(prev) : value;
      if (typeof window !== 'undefined') {
        localStorage.setItem('sidebar-favorites-expanded', String(newValue));
      }
      return newValue;
    });
  };

  useEffect(() => {
    const supabase = createClient();

    if (initialUser) {
      setLoading(false);
    } else {
      supabase.auth.getUser().then(({ data: { user } }) => {
        setUser(user);
        setLoading(false);
      });
    }

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, [initialUser]);

  // Close user menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
        setIsUserMenuOpen(false);
      }
    };

    if (isUserMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isUserMenuOpen]);

  // Fetch people data
  useEffect(() => {
    if (!user) return;

    const fetchPeople = async () => {
      setPeopleLoading(true);
      try {
        const [peopleRes, favoritesRes] = await Promise.all([
          fetch('/api/people'),
          fetch('/api/people?favorites=true'),
        ]);

        if (peopleRes.ok) {
          const peopleData = await peopleRes.json();
          setPeople(peopleData.people || []);
        }

        if (favoritesRes.ok) {
          const favoritesData = await favoritesRes.json();
          setFavorites(favoritesData.people || []);
        }
      } catch (error) {
        console.error('Error fetching people:', error);
      } finally {
        setPeopleLoading(false);
      }
    };

    fetchPeople();
  }, [user]);

  // Logout handler
  const handleLogout = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push('/');
    router.refresh();
  };

  // Handle delete person
  const handleDeletePerson = async (personId: string) => {
    setDeleteLoading(true);
    try {
      const response = await fetch(`/api/people/${personId}`, {
        method: 'DELETE',
      });

      const result = await response.json();

      if (response.ok && result.success) {
        setPeople((prev) => prev.filter((p) => p.id !== personId));
        setFavorites((prev) => prev.filter((p) => p.id !== personId));
        showSuccessToast('Person deleted');
        router.refresh();
      } else {
        throw new Error(result.error || 'Failed to delete person');
      }
    } catch (error) {
      console.error('Error deleting person:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to delete person';
      showErrorToast(errorMessage);
    } finally {
      setDeleteLoading(false);
    }
  };

  // Handle toggle favorite
  // This function is called AFTER the API call has already been made in PeopleListItem
  // So we just need to update the state, not make another API call
  const handleToggleFavorite = async (personId: string, isFavorite: boolean) => {
    // Update people list
    setPeople((prev) => {
      const updated = prev.map((p) => 
        p.id === personId 
          ? { ...p, is_favorite: isFavorite } 
          : p
      );
      return updated;
    });

    // Refetch both people and favorites to ensure state is in sync with database
    try {
      const [peopleRes, favoritesRes] = await Promise.all([
        fetch('/api/people'),
        fetch('/api/people?favorites=true'),
      ]);
      
      if (peopleRes.ok) {
        const peopleData = await peopleRes.json();
        setPeople(peopleData.people || []);
      }
      
      if (favoritesRes.ok) {
        const favoritesData = await favoritesRes.json();
        setFavorites(favoritesData.people || []);
      }
    } catch (fetchError) {
      console.error('Error refetching favorites:', fetchError);
      // Fallback: manually update favorites list if refetch fails
      if (isFavorite) {
        const personWithNote = people.find((p) => p.id === personId);
        if (personWithNote) {
          setFavorites((prev) => {
            if (prev.some((p) => p.id === personId)) {
              return prev.map((p) => (p.id === personId ? { ...personWithNote, is_favorite: true } : p));
            }
            return [...prev, { ...personWithNote, is_favorite: true }];
          });
        }
      } else {
        setFavorites((prev) => prev.filter((p) => p.id !== personId));
      }
    }
  };

  // Handle person added
  const handlePersonAdded = async () => {
    // Refresh people list
    try {
      const [peopleRes, favoritesRes] = await Promise.all([
        fetch('/api/people'),
        fetch('/api/people?favorites=true'),
      ]);

      if (peopleRes.ok) {
        const peopleData = await peopleRes.json();
        setPeople(peopleData.people || []);
      }

      if (favoritesRes.ok) {
        const favoritesData = await favoritesRes.json();
        setFavorites(favoritesData.people || []);
      }
    } catch (error) {
      console.error('Error refreshing people:', error);
    }
  };

  // Filter people based on search
  const filteredPeople = people.filter((person) => {
    const query = peopleSearchQuery.toLowerCase().trim();
    if (!query) return true;
    return person.name.toLowerCase().includes(query);
  });


  if (loading) {
    return <SidebarSkeleton />;
  }

  if (!user) {
    return null;
  }

  const isActive = (path: string) => pathname === path;

  return (
    <div className="h-full flex flex-col">
      {/* Sticky Header Section */}
      <div className="flex-shrink-0 border-b" style={{ borderColor: 'var(--border-color)', paddingTop: '1.5rem', paddingBottom: '1.5rem' }}>
        {/* Header with branding */}
        <div className="flex items-center py-4 px-4">
          <Link href="/home" className="flex items-center gap-3 px-3 hover:opacity-80 transition-opacity">
            <div className="w-6 h-6 rounded-md flex items-center justify-center flex-shrink-0" style={{ background: 'linear-gradient(135deg, #a855f7 0%, #7c3aed 100%)' }}>
              <span className="text-white font-medium text-sm">R</span>
            </div>
            <span className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>Refracty</span>
          </Link>
        </div>

        {/* User and Home - Sticky */}
        <div className="px-4 space-y-1">
          {/* User */}
          <div className="relative" ref={userMenuRef}>
            <button
              onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
              className="group relative flex items-center gap-3 px-3 py-2 rounded-md sidebar-link transition-colors w-full"
            >
{user.user_metadata?.avatar_url ? (
                <img
                  src={user.user_metadata.avatar_url}
                  alt="User avatar"
                  className="w-5 h-5 rounded-full object-cover flex-shrink-0"
                />
              ) : (
                <div className="w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0" style={{ background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)' }}>
                  <span className="text-white text-[9px] font-medium">{getUserInitials(user)}</span>
                </div>
              )}
              <span className="flex-1 text-sm text-left truncate font-semibold" style={{ color: 'var(--text-primary)' }}>
                {getUserDisplayName(user)}
              </span>
            </button>

            {isUserMenuOpen && (
              <div
                className="absolute left-0 mt-1 w-48 rounded-md shadow-lg z-50 border"
                style={{
                  backgroundColor: 'var(--bg-primary)',
                  borderColor: 'var(--border-color)',
                }}
              >
                <div className="py-1">
                  {/* Settings */}
                  <Link
                    href="/settings"
                    onClick={() => setIsUserMenuOpen(false)}
                    className="flex items-center gap-3 px-4 py-2 text-sm hover:bg-tertiary transition-colors"
                    style={{
                      color: 'var(--text-primary)',
                      backgroundColor: 'transparent',
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = 'var(--bg-tertiary)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = 'transparent';
                    }}
                  >
                    <SettingsIcon className="w-4 h-4 flex-shrink-0" />
                    <span>Settings</span>
                  </Link>

                  {/* Logout */}
                  <button
                    onClick={handleLogout}
                    className="w-full text-left flex items-center gap-3 px-4 py-2 text-sm hover:bg-tertiary transition-colors"
                    style={{
                      color: '#ef4444',
                      backgroundColor: 'transparent',
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = 'var(--bg-tertiary)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = 'transparent';
                    }}
                  >
                    <svg
                      className="w-4 h-4 flex-shrink-0"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                      />
                    </svg>
                    <span>Logout</span>
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Home */}
          <Link
            href="/home"
            className="flex items-center gap-3 px-3 py-2 rounded-md text-sm font-semibold sidebar-link transition-colors"
          >
            <HomeIcon className="w-5 h-5 flex-shrink-0" />
            <span>Home</span>
          </Link>
        </div>
      </div>

      {/* Scrollable Navigation items */}
      <nav className="flex-1 overflow-y-auto px-4 pt-4 space-y-3 scrollbar-hide" style={{ paddingBottom: '10rem' }}>

        {/* Favorites Section */}
        <div className="mt-1">
          {/* Favorites Header */}
          <div className="group relative flex items-center gap-3 px-3 py-2 rounded-md transition-colors"
            onMouseEnter={(e) => {
              // Don't apply hover styles on touch devices or during touch interactions
              if (isTouchDevice.current || isTouching.current) {
                return;
              }
              e.currentTarget.style.backgroundColor = 'var(--bg-tertiary)';
            }}
            onMouseLeave={(e) => {
              // Don't handle mouse leave on touch devices
              if (isTouchDevice.current) {
                return;
              }
              e.currentTarget.style.backgroundColor = 'transparent';
            }}
            onTouchStart={(e) => {
              isTouching.current = true;
              // Clear any existing hover state immediately
              resetHoverState(e.currentTarget);
            }}
            onTouchEnd={(e) => {
              const element = e.currentTarget;
              // Immediately clear any hover state that might have been applied
              resetHoverState(element);
              // Reset touching flag after a short delay to allow click to fire
              setTimeout(() => {
                isTouching.current = false;
              }, 100);
              // Also clear hover state after delays to catch any delayed hover states from iOS
              setTimeout(() => {
                resetHoverState(element);
              }, 50);
              setTimeout(() => {
                resetHoverState(element);
              }, 200);
              setTimeout(() => {
                resetHoverState(element);
              }, 500);
            }}
          >
            <button
              onClick={() => setIsFavoritesExpanded(!isFavoritesExpanded)}
              className="flex items-center gap-2 flex-1 text-sm font-semibold"
              style={{ color: 'var(--text-primary)' }}
            >
              <svg
                className={`w-4 h-4 transition-transform ${isFavoritesExpanded ? 'rotate-90' : ''}`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
              <span>Favorites</span>
              <span className="text-xs" style={{ color: 'var(--text-tertiary)' }}>
                {favorites.length}
              </span>
            </button>
          </div>

          {/* Favorites List */}
          {isFavoritesExpanded && (
            <div className="space-y-0.5">
              {peopleLoading ? (
                <>
                  <SidebarListItemSkeleton />
                  <SidebarListItemSkeleton />
                  <SidebarListItemSkeleton />
                </>
              ) : favorites.length === 0 ? (
                <div className="px-3 py-2 text-xs" style={{ color: 'var(--text-tertiary)' }}>
                  No favorites yet
                </div>
              ) : (
                favorites.map((person) => (
                  <PeopleListItem
                    key={person.id}
                    person={person}
                    onDelete={handleDeletePerson}
                    onToggleFavorite={handleToggleFavorite}
                    loading={deleteLoading}
                  />
                ))
              )}
            </div>
          )}
        </div>

        {/* People Section */}
        <div className="mt-6">
          {/* People Header */}
          <div className="group relative flex items-center gap-3 px-3 py-2 rounded-md transition-colors"
            onMouseEnter={(e) => {
              // Don't apply hover styles on touch devices or during touch interactions
              if (isTouchDevice.current || isTouching.current) {
                return;
              }
              e.currentTarget.style.backgroundColor = 'var(--bg-tertiary)';
            }}
            onMouseLeave={(e) => {
              // Don't handle mouse leave on touch devices
              if (isTouchDevice.current) {
                return;
              }
              e.currentTarget.style.backgroundColor = 'transparent';
            }}
            onTouchStart={(e) => {
              isTouching.current = true;
              // Clear any existing hover state immediately
              resetHoverState(e.currentTarget);
            }}
            onTouchEnd={(e) => {
              const element = e.currentTarget;
              // Immediately clear any hover state that might have been applied
              resetHoverState(element);
              // Reset touching flag after a short delay to allow click to fire
              setTimeout(() => {
                isTouching.current = false;
              }, 100);
              // Also clear hover state after delays to catch any delayed hover states from iOS
              setTimeout(() => {
                resetHoverState(element);
              }, 50);
              setTimeout(() => {
                resetHoverState(element);
              }, 200);
              setTimeout(() => {
                resetHoverState(element);
              }, 500);
            }}
          >
            <button
              onClick={() => setIsPeopleExpanded(!isPeopleExpanded)}
              className="flex items-center gap-2 flex-1 text-sm font-semibold"
              style={{ color: 'var(--text-primary)' }}
            >
              <svg
                className={`w-4 h-4 transition-transform ${isPeopleExpanded ? 'rotate-90' : ''}`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
              <span>People</span>
              <span className="text-xs" style={{ color: 'var(--text-tertiary)' }}>
                {people.length}
              </span>
            </button>
            <IconButton
              variant="group-hover"
              size="sm"
              onClick={(e) => {
                e.stopPropagation();
                setIsAddModalOpen(true);
              }}
              aria-label="Add person"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
            </IconButton>
          </div>

          {/* People Search */}
          {isPeopleExpanded && (
            <div className="px-3 mt-2 mb-2">
              <input
                type="search"
                placeholder="Search people..."
                value={peopleSearchQuery}
                onChange={(e) => setPeopleSearchQuery(e.target.value)}
                className="w-full px-2 py-1.5 text-xs border rounded-md focus:outline-none focus:ring-1 focus:ring-primary"
                style={{
                  backgroundColor: 'var(--bg-primary)',
                  borderColor: 'var(--border-color)',
                  color: 'var(--text-primary)',
                }}
              />
            </div>
          )}

          {/* People List */}
          {isPeopleExpanded && (
            <div className="space-y-0.5">
              {peopleLoading ? (
                <>
                  <SidebarListItemSkeleton />
                  <SidebarListItemSkeleton />
                  <SidebarListItemSkeleton />
                </>
              ) : filteredPeople.length === 0 ? (
                <div className="px-3 py-2 text-xs" style={{ color: 'var(--text-tertiary)' }}>
                  {peopleSearchQuery ? 'No matches' : 'No people yet'}
                </div>
              ) : (
                filteredPeople.map((person) => (
                  <PeopleListItem
                    key={person.id}
                    person={person}
                    onDelete={handleDeletePerson}
                    onToggleFavorite={handleToggleFavorite}
                    loading={deleteLoading}
                  />
                ))
              )}
            </div>
          )}
        </div>
      </nav>

      {/* Add Person Modal */}
      <AddPersonModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onPersonAdded={handlePersonAdded}
      />
    </div>
  );
}

