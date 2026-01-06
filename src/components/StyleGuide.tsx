'use client';

import { useState } from 'react';
import { Breadcrumb } from './Breadcrumb';
import { PageActions } from './PageActions';
import type { PageAction } from './PageActions';
import { showSuccessToast, showErrorToast } from '@/lib/toast';
import { Shimmer } from './Shimmer';

export function StyleGuide() {
  const [activeTab, setActiveTab] = useState<'tab1' | 'tab2'>('tab1');

  const pageActions: PageAction[] = [
    { label: 'Edit', onClick: () => console.log('Edit') },
    { label: 'Delete', onClick: () => console.log('Delete'), destructive: true },
  ];

  return (
    <div className="space-y-12 pb-12">
      {/* Colors */}
      <section>
        <h2 className="text-2xl font-bold mb-6">Colors</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div>
            <div className="h-20 rounded-md mb-2" style={{ backgroundColor: 'var(--bg-primary)' }}></div>
            <p className="text-sm font-medium">bg-primary</p>
            <p className="text-xs" style={{ color: 'var(--text-tertiary)' }}>var(--bg-primary)</p>
          </div>
          <div>
            <div className="h-20 rounded-md mb-2 border" style={{ backgroundColor: 'var(--bg-secondary)', borderColor: 'var(--border-color)' }}></div>
            <p className="text-sm font-medium">bg-secondary</p>
            <p className="text-xs" style={{ color: 'var(--text-tertiary)' }}>var(--bg-secondary)</p>
          </div>
          <div>
            <div className="h-20 rounded-md mb-2 border" style={{ backgroundColor: 'var(--bg-tertiary)', borderColor: 'var(--border-color)' }}></div>
            <p className="text-sm font-medium">bg-tertiary</p>
            <p className="text-xs" style={{ color: 'var(--text-tertiary)' }}>var(--bg-tertiary)</p>
          </div>
          <div>
            <div className="h-20 rounded-md mb-2 border" style={{ background: 'var(--bg-gradient)', borderColor: 'var(--border-color)' }}></div>
            <p className="text-sm font-medium">bg-gradient</p>
            <p className="text-xs" style={{ color: 'var(--text-tertiary)' }}>var(--bg-gradient)</p>
          </div>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
          <div>
            <p className="text-lg font-semibold mb-2" style={{ color: 'var(--text-primary)' }}>text-primary</p>
            <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>text-secondary</p>
            <p className="text-xs" style={{ color: 'var(--text-tertiary)' }}>text-tertiary</p>
          </div>
          <div>
            <div className="h-12 rounded-md mb-2 border" style={{ borderColor: 'var(--border-color)' }}></div>
            <p className="text-sm font-medium">border-color</p>
          </div>
        </div>
      </section>

      {/* Typography */}
      <section>
        <h2 className="text-2xl font-bold mb-6">Typography</h2>
        <div className="space-y-4">
          <div>
            <h1 className="text-4xl font-bold" style={{ color: 'var(--text-primary)' }}>Heading 1</h1>
            <p className="text-xs mt-1" style={{ color: 'var(--text-tertiary)' }}>text-4xl font-bold</p>
          </div>
          <div>
            <h2 className="text-3xl font-bold" style={{ color: 'var(--text-primary)' }}>Heading 2</h2>
            <p className="text-xs mt-1" style={{ color: 'var(--text-tertiary)' }}>text-3xl font-bold</p>
          </div>
          <div>
            <h3 className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>Heading 3</h3>
            <p className="text-xs mt-1" style={{ color: 'var(--text-tertiary)' }}>text-2xl font-bold</p>
          </div>
          <div>
            <p className="text-base" style={{ color: 'var(--text-primary)' }}>Body text - Regular paragraph text that flows naturally and is easy to read.</p>
            <p className="text-xs mt-1" style={{ color: 'var(--text-tertiary)' }}>text-base</p>
          </div>
          <div>
            <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>Small text - Used for secondary information and labels.</p>
            <p className="text-xs mt-1" style={{ color: 'var(--text-tertiary)' }}>text-sm</p>
          </div>
          <div>
            <p className="text-xs" style={{ color: 'var(--text-tertiary)' }}>Extra small text - For timestamps, hints, and tertiary information.</p>
            <p className="text-xs mt-1" style={{ color: 'var(--text-tertiary)' }}>text-xs</p>
          </div>
        </div>
      </section>

      {/* Buttons */}
      <section>
        <h2 className="text-2xl font-bold mb-6">Buttons</h2>
        <div className="space-y-4">
          <div className="flex flex-wrap gap-3">
            <button className="btn-primary">Primary Button</button>
            <button className="btn-secondary">Secondary Button</button>
            <button className="btn-outline border rounded-md px-4 py-2 text-sm font-medium">Outline Button</button>
            <button className="btn-ghost px-4 py-2 text-sm font-medium rounded-md">Ghost Button</button>
            <button className="btn-danger">Danger Button</button>
          </div>
          <div className="flex flex-wrap gap-3">
            <button className="btn-primary" disabled>Disabled Primary</button>
            <button className="btn-secondary" disabled>Disabled Secondary</button>
          </div>
        </div>
      </section>

      {/* Form Inputs */}
      <section>
        <h2 className="text-2xl font-bold mb-6">Form Inputs</h2>
        <div className="space-y-4 max-w-md">
          <div>
            <label className="label block text-sm font-medium mb-2">Text Input</label>
            <input type="text" className="input w-full px-3 py-2 border rounded-md" placeholder="Enter text..." />
          </div>
          <div>
            <label className="label block text-sm font-medium mb-2">Search Input</label>
            <input type="search" className="input w-full px-3 py-2 border rounded-md" placeholder="Search..." />
          </div>
          <div>
            <label className="label block text-sm font-medium mb-2">Textarea</label>
            <textarea className="input w-full px-3 py-2 border rounded-md resize-y" rows={4} placeholder="Enter multiple lines..."></textarea>
          </div>
        </div>
      </section>

      {/* Cards */}
      <section>
        <h2 className="text-2xl font-bold mb-6">Cards</h2>
        <div className="grid md:grid-cols-2 gap-4">
          <div 
            className="p-6 rounded-lg border"
            style={{ backgroundColor: 'var(--bg-primary)', borderColor: 'var(--border-color)' }}
          >
            <h3 className="text-lg font-semibold mb-2" style={{ color: 'var(--text-primary)' }}>Card (p-6)</h3>
            <p style={{ color: 'var(--text-secondary)' }}>Card with standard padding (p-6). Used for profile sections and larger content areas.</p>
          </div>
          <div className="p-4 rounded-lg border" style={{ backgroundColor: 'var(--bg-primary)', borderColor: 'var(--border-color)' }}>
            <h3 className="text-lg font-semibold mb-2" style={{ color: 'var(--text-primary)' }}>Card (p-4)</h3>
            <p style={{ color: 'var(--text-secondary)' }}>Card with compact padding (p-4). Used for lists, feed items, and tighter layouts.</p>
          </div>
        </div>
      </section>

      {/* Alerts */}
      <section>
        <h2 className="text-2xl font-bold mb-6">Alerts</h2>
        <div className="space-y-3 max-w-md">
          <div className="alert-error">This is an error alert message.</div>
          <div className="alert-success">This is a success alert message.</div>
        </div>
      </section>

      {/* Badges/Labels */}
      <section>
        <h2 className="text-2xl font-bold mb-6">Badges & Labels</h2>
        <div className="flex flex-wrap gap-3 items-center">
          <span className="text-xs px-2 py-0.5 rounded" style={{ backgroundColor: 'var(--bg-tertiary)', color: 'var(--text-secondary)' }}>
            Note
          </span>
          <span className="text-xs px-2 py-0.5 rounded" style={{ backgroundColor: 'var(--bg-tertiary)', color: 'var(--text-secondary)' }}>
            Motivated by
          </span>
          <span className="text-xs px-2 py-0.5 rounded" style={{ backgroundColor: 'var(--bg-tertiary)', color: 'var(--text-secondary)' }}>
            Preferred communication
          </span>
          <span className="label text-sm">Label Text</span>
        </div>
      </section>

      {/* Shimmer */}
      <section>
        <h2 className="text-2xl font-bold mb-6">Shimmer</h2>
        <div className="space-y-6">
          <div>
            <p className="text-sm mb-4" style={{ color: 'var(--text-secondary)' }}>
              Animated text effect with a gradient that slides across. Perfect for loading states and placeholder text.
            </p>
          </div>

          {/* Different Sizes */}
          <div>
            <h3 className="text-lg font-semibold mb-3" style={{ color: 'var(--text-primary)' }}>Sizes</h3>
            <div className="space-y-3">
              <div>
                <Shimmer text="Extra Small Shimmer Text" size="xs" />
                <p className="text-xs mt-1" style={{ color: 'var(--text-tertiary)' }}>size="xs"</p>
              </div>
              <div>
                <Shimmer text="Small Shimmer Text" size="sm" />
                <p className="text-xs mt-1" style={{ color: 'var(--text-tertiary)' }}>size="sm"</p>
              </div>
              <div>
                <Shimmer text="Base Shimmer Text" size="base" />
                <p className="text-xs mt-1" style={{ color: 'var(--text-tertiary)' }}>size="base"</p>
              </div>
              <div>
                <Shimmer text="Large Shimmer Text" size="lg" />
                <p className="text-xs mt-1" style={{ color: 'var(--text-tertiary)' }}>size="lg"</p>
              </div>
              <div>
                <Shimmer text="Extra Large Shimmer Text" size="xl" />
                <p className="text-xs mt-1" style={{ color: 'var(--text-tertiary)' }}>size="xl"</p>
              </div>
            </div>
          </div>

          {/* Different Speeds */}
          <div>
            <h3 className="text-lg font-semibold mb-3" style={{ color: 'var(--text-primary)' }}>Animation Speeds</h3>
            <div className="space-y-3">
              <div>
                <Shimmer text="Fast Shimmer (1s)" speed={1} />
                <p className="text-xs mt-1" style={{ color: 'var(--text-tertiary)' }}>speed={1}</p>
              </div>
              <div>
                <Shimmer text="Default Shimmer (2s)" speed={2} />
                <p className="text-xs mt-1" style={{ color: 'var(--text-tertiary)' }}>speed={2} (default)</p>
              </div>
              <div>
                <Shimmer text="Slow Shimmer (4s)" speed={4} />
                <p className="text-xs mt-1" style={{ color: 'var(--text-tertiary)' }}>speed={4}</p>
              </div>
            </div>
          </div>

          {/* Custom Colors */}
          <div>
            <h3 className="text-lg font-semibold mb-3" style={{ color: 'var(--text-primary)' }}>Custom Colors</h3>
            <div className="space-y-3">
              <div>
                <Shimmer 
                  text="Custom Gradient Shimmer" 
                  colors={['#667eea', '#764ba2', '#f093fb', '#764ba2', '#667eea']}
                />
                <p className="text-xs mt-1" style={{ color: 'var(--text-tertiary)' }}>
                  colors={['#667eea', '#764ba2', '#f093fb', '#764ba2', '#667eea']}
                </p>
              </div>
              <div>
                <Shimmer 
                  text="Blue Gradient Shimmer" 
                  colors={['#3b82f6', '#60a5fa', '#93c5fd', '#60a5fa', '#3b82f6']}
                />
                <p className="text-xs mt-1" style={{ color: 'var(--text-tertiary)' }}>
                  colors={['#3b82f6', '#60a5fa', '#93c5fd', '#60a5fa', '#3b82f6']}
                </p>
              </div>
            </div>
          </div>

          {/* Usage Example */}
          <div className="border rounded-lg p-4" style={{ borderColor: 'var(--border-color)', backgroundColor: 'var(--bg-tertiary)' }}>
            <h3 className="text-lg font-semibold mb-3" style={{ color: 'var(--text-primary)' }}>Usage</h3>
            <div className="space-y-2 text-sm" style={{ color: 'var(--text-secondary)' }}>
              <p><strong>Basic:</strong></p>
              <code className="block p-2 rounded text-xs" style={{ backgroundColor: 'var(--bg-primary)' }}>
                {'<Shimmer text="Loading..." />'}
              </code>
              <p className="mt-3"><strong>With Options:</strong></p>
              <code className="block p-2 rounded text-xs" style={{ backgroundColor: 'var(--bg-primary)' }}>
                {'<Shimmer text="Placeholder text" size="lg" speed={3} />'}
              </code>
            </div>
          </div>
        </div>
      </section>

      {/* Breadcrumbs */}
      <section>
        <h2 className="text-2xl font-bold mb-6">Breadcrumbs</h2>
        <Breadcrumb items={[
          { label: 'People', href: '/people' },
          { label: 'Cory Wilkerson' },
        ]} />
      </section>

      {/* Dropdown Menus */}
      <section>
        <h2 className="text-2xl md:text-4xl font-bold mb-6">Dropdown Menus</h2>
        <div className="space-y-8">
          {/* Usage Guidelines */}
          <div className="border rounded-lg p-4" style={{ borderColor: 'var(--border-color)', backgroundColor: 'var(--bg-tertiary)' }}>
            <h3 className="text-lg md:text-xl font-semibold mb-3" style={{ color: 'var(--text-primary)' }}>Usage Guidelines</h3>
            <div className="space-y-2 text-sm md:text-xs" style={{ color: 'var(--text-secondary)' }}>
              <p><strong>Common Structure:</strong> Dropdowns use <code className="px-1 py-0.5 rounded" style={{ backgroundColor: 'var(--bg-primary)' }}>absolute</code> positioning with <code className="px-1 py-0.5 rounded" style={{ backgroundColor: 'var(--bg-primary)' }}>z-50</code> or higher for proper layering.</p>
              <p><strong>Styling:</strong> <code className="px-1 py-0.5 rounded" style={{ backgroundColor: 'var(--bg-primary)' }}>rounded-md shadow-lg border</code> with theme-aware background and border colors.</p>
              <p><strong>Hover States:</strong> Items use <code className="px-1 py-0.5 rounded" style={{ backgroundColor: 'var(--bg-primary)' }}>hover:bg-tertiary</code> for interactive feedback.</p>
              <p><strong>Click Outside:</strong> All dropdowns close when clicking outside the menu area.</p>
            </div>
          </div>

          {/* Page Actions Menu */}
          <div className="border rounded-lg p-4" style={{ borderColor: 'var(--border-color)', backgroundColor: 'var(--bg-primary)' }}>
            <h3 className="text-lg md:text-xl font-semibold mb-3" style={{ color: 'var(--text-primary)' }}>Page Actions Menu</h3>
            <p className="text-sm md:text-xs mb-4" style={{ color: 'var(--text-secondary)' }}>
              Simple action menu triggered by horizontal three-dot icon. Used for page-level actions like Edit, Delete, etc.
            </p>
            <div className="flex items-center gap-4">
              <PageActions actions={pageActions} />
              <p className="text-sm md:text-xs" style={{ color: 'var(--text-secondary)' }}>Click the three dots to see the menu</p>
            </div>
            <div className="mt-4 p-3 rounded border" style={{ backgroundColor: 'var(--bg-tertiary)', borderColor: 'var(--border-color)' }}>
              <p className="text-xs font-mono mb-2" style={{ color: 'var(--text-secondary)' }}>Classes:</p>
              <code className="text-xs" style={{ color: 'var(--text-primary)' }}>
                absolute right-0 mt-2 w-48 rounded-md shadow-lg z-[60] border
              </code>
            </div>
          </div>

          {/* Mobile Breadcrumb Dropdown */}
          <div className="border rounded-lg p-4" style={{ borderColor: 'var(--border-color)', backgroundColor: 'var(--bg-primary)' }}>
            <h3 className="text-lg md:text-xl font-semibold mb-3" style={{ color: 'var(--text-primary)' }}>Mobile Breadcrumb Dropdown</h3>
            <p className="text-sm md:text-xs mb-4" style={{ color: 'var(--text-secondary)' }}>
              Mobile-only dropdown that appears when clicking the page title. Shows navigation hierarchy with a title section and breadcrumb items. Current page is highlighted with a down-right arrow icon.
            </p>
            <div className="relative inline-block">
              <div
                className="w-64 rounded-md shadow-lg border"
                style={{
                  backgroundColor: 'var(--bg-primary)',
                  borderColor: 'var(--border-color)',
                }}
              >
                {/* Title */}
                <div className="px-4 py-2 border-b" style={{ borderColor: 'var(--border-color)' }}>
                  <span className="text-xs font-semibold uppercase tracking-wide" style={{ color: 'var(--text-secondary)' }}>
                    Breadcrumb
                  </span>
                </div>
                {/* Breadcrumb items */}
                <div className="py-1">
                  <div className="flex items-center px-4 py-2 text-sm hover:bg-tertiary transition-colors" style={{ color: 'var(--text-primary)' }}>
                    <span>People</span>
                  </div>
                  <div
                    className="flex items-center gap-2 px-4 py-2 text-sm font-medium"
                    style={{
                      color: 'var(--text-primary)',
                      backgroundColor: 'var(--bg-tertiary)',
                    }}
                  >
                    <svg
                      className="w-4 h-4 flex-shrink-0"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                      style={{ color: 'var(--text-tertiary)' }}
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4V5.4C4 8.76031 4 10.4405 4.65396 11.7239C5.2292 12.8529 6.14708 13.7708 7.27606 14.346C8.55953 15 10.2397 15 13.6 15H20M20 15L15 10M20 15L15 20" />
                    </svg>
                    <span className="flex-1">Cory Wilkerson</span>
                  </div>
                </div>
              </div>
            </div>
            <div className="mt-4 p-3 rounded border" style={{ backgroundColor: 'var(--bg-tertiary)', borderColor: 'var(--border-color)' }}>
              <p className="text-xs font-mono mb-2" style={{ color: 'var(--text-secondary)' }}>Classes:</p>
              <code className="text-xs" style={{ color: 'var(--text-primary)' }}>
                absolute top-full left-0 mt-2 w-64 rounded-md shadow-lg z-50 border
              </code>
            </div>
          </div>

          {/* Nested Menu (Notes Tab) */}
          <div className="border rounded-lg p-4" style={{ borderColor: 'var(--border-color)', backgroundColor: 'var(--bg-primary)' }}>
            <h3 className="text-lg md:text-xl font-semibold mb-3" style={{ color: 'var(--text-primary)' }}>Nested Menu with Submenu</h3>
            <p className="text-sm md:text-xs mb-4" style={{ color: 'var(--text-secondary)' }}>
              Dropdown menu with nested submenu functionality. Used in NotesTab for "Move to..." actions. Submenu auto-positions to the left if there's not enough space on the right.
            </p>
            <div className="p-3 rounded border" style={{ backgroundColor: 'var(--bg-tertiary)', borderColor: 'var(--border-color)' }}>
              <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>
                See NotesTab component for implementation. Submenus use dynamic positioning based on available viewport space.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Tabs */}
      <section>
        <h2 className="text-2xl font-bold mb-6">Tabs</h2>
        <div className="border-b mb-6" style={{ borderColor: 'var(--border-color)' }}>
          <div className="flex gap-6">
            <button
              onClick={() => setActiveTab('tab1')}
              className="pb-3 px-1 font-medium text-sm transition-colors border-b-2"
              style={{
                borderColor: activeTab === 'tab1' ? 'var(--text-primary)' : 'transparent',
                color: activeTab === 'tab1' ? 'var(--text-primary)' : 'var(--text-secondary)',
              }}
            >
              Insights
            </button>
            <button
              onClick={() => setActiveTab('tab2')}
              className="pb-3 px-1 font-medium text-sm transition-colors border-b-2"
              style={{
                borderColor: activeTab === 'tab2' ? 'var(--text-primary)' : 'transparent',
                color: activeTab === 'tab2' ? 'var(--text-primary)' : 'var(--text-secondary)',
              }}
            >
              My Notes (5)
            </button>
          </div>
        </div>
        <div className="p-4 rounded-lg border" style={{ backgroundColor: 'var(--bg-primary)', borderColor: 'var(--border-color)' }}>
          <p style={{ color: 'var(--text-secondary)' }}>Tab content for: {activeTab === 'tab1' ? 'Insights' : 'My Notes'}</p>
        </div>
      </section>

      {/* Avatars */}
      <section>
        <h2 className="text-2xl font-bold mb-6">Avatars</h2>
        <div className="flex flex-wrap gap-4 items-center">
          <div className="w-16 h-16 rounded-full bg-primary text-white flex items-center justify-center text-xl font-medium">
            CW
          </div>
          <div className="w-12 h-12 rounded-full bg-primary text-white flex items-center justify-center text-sm font-medium">
            JB
          </div>
          <div className="w-10 h-10 rounded-full bg-primary text-white flex items-center justify-center text-xs font-medium">
            JD
          </div>
          <div className="w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center text-xs font-medium">
            N
          </div>
        </div>
      </section>

      {/* Lists */}
      <section>
        <h2 className="text-2xl font-bold mb-6">People List Cards</h2>
        <div className="space-y-3 max-w-md">
          <div className="p-4 rounded-lg border" style={{ backgroundColor: 'var(--bg-primary)', borderColor: 'var(--border-color)' }}>
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-primary text-white flex items-center justify-center flex-shrink-0 text-sm font-medium">
                CW
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-lg mb-1" style={{ color: 'var(--text-primary)' }}>Cory Wilkerson</h3>
                <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>Thinks best out loud</p>
              </div>
            </div>
          </div>
          <div className="p-4 rounded-lg border" style={{ backgroundColor: 'var(--bg-primary)', borderColor: 'var(--border-color)' }}>
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-primary text-white flex items-center justify-center flex-shrink-0 text-sm font-medium">
                JB
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-lg mb-1" style={{ color: 'var(--text-primary)' }}>Jason Bobby</h3>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Feed Items */}
      <section>
        <h2 className="text-2xl font-bold mb-6">Feed Items (Insights & Notes)</h2>
        <div className="space-y-4 max-w-2xl">
          <div className="p-4 rounded-lg border" style={{ backgroundColor: 'var(--bg-primary)', borderColor: 'var(--border-color)' }}>
            <div className="flex items-start justify-between gap-4 mb-2">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-semibold" style={{ color: 'var(--text-primary)' }}>Cory Wilkerson</span>
                  <span className="text-xs px-2 py-0.5 rounded" style={{ backgroundColor: 'var(--bg-tertiary)', color: 'var(--text-secondary)' }}>
                    Motivated by
                  </span>
                </div>
                <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>2 hours ago</p>
              </div>
            </div>
            <p className="mt-2" style={{ color: 'var(--text-primary)' }}>This is an example insight about what motivates this person.</p>
          </div>
          <div className="p-4 rounded-lg border" style={{ backgroundColor: 'var(--bg-primary)', borderColor: 'var(--border-color)' }}>
            <div className="flex items-start justify-between gap-4 mb-2">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-semibold" style={{ color: 'var(--text-primary)' }}>Jane Doe</span>
                  <span className="text-xs px-2 py-0.5 rounded" style={{ backgroundColor: 'var(--bg-tertiary)', color: 'var(--text-secondary)' }}>
                    Note
                  </span>
                </div>
                <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>1 day ago</p>
              </div>
            </div>
            <p className="mt-2" style={{ color: 'var(--text-primary)' }}>This is an example note captured about this person.</p>
          </div>
        </div>
      </section>

      {/* Toasts */}
      <section>
        <h2 className="text-2xl font-bold mb-6">Toasts</h2>
        <div className="space-y-4">
          <div>
            <h3 className="text-lg font-semibold mb-3" style={{ color: 'var(--text-primary)' }}>Success Toast</h3>
            <button
              onClick={() => showSuccessToast('Operation completed successfully')}
              className="btn-primary px-4 py-2 rounded-md"
            >
              Show Success Toast
            </button>
          </div>
          <div>
            <h3 className="text-lg font-semibold mb-3" style={{ color: 'var(--text-primary)' }}>Success Toast with Link</h3>
            <button
              onClick={() => showSuccessToast('Person added', { href: '/people/123', text: 'View person' })}
              className="btn-primary px-4 py-2 rounded-md"
            >
              Show Success Toast with Link
            </button>
          </div>
          <div>
            <h3 className="text-lg font-semibold mb-3" style={{ color: 'var(--text-primary)' }}>Error Toast</h3>
            <button
              onClick={() => showErrorToast('Something went wrong. Please try again.')}
              className="btn-danger px-4 py-2 rounded-md"
            >
              Show Error Toast
            </button>
          </div>
        </div>
      </section>

      {/* Insight Capture */}
      <section>
        <h2 className="text-2xl font-bold mb-6">Insight Capture Component</h2>
        <div className="max-w-3xl mx-auto">
          <div 
            className="py-4 shadow-lg"
            style={{ 
              backgroundColor: 'var(--bg-primary)',
              borderTop: '1px solid var(--border-color)',
              borderLeft: '1px solid var(--border-color)',
              borderRight: '1px solid var(--border-color)',
              borderTopLeftRadius: '1rem',
              borderTopRightRadius: '1rem',
            }}
          >
            <div className="px-4">
              <div className="flex items-center gap-3">
                <div className="flex-1 relative">
                  <input
                    type="text"
                    placeholder="Add a note about someone..."
                    className="input w-full px-4 py-3 pr-20 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                    disabled
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs" style={{ color: 'var(--text-tertiary)' }}>
                    0/144
                  </span>
                </div>
                <button className="btn-primary p-3 rounded-lg flex-shrink-0" disabled>
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" />
                  </svg>
                </button>
              </div>
              <p className="text-xs mt-2 text-center" style={{ color: 'var(--text-tertiary)' }}>
                One idea per note keeps things clearer later.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

