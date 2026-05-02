import BottomNav from '@/components/BottomNav'

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      {/* ── W-GESTÃO badge — fixed top-right ── */}
      <div
        className="fixed top-3 right-3 z-50 flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl"
        style={{
          background: 'rgba(6,9,15,0.88)',
          border: '1px solid rgba(0,214,143,0.5)',
          backdropFilter: 'blur(12px)',
          boxShadow: '0 0 18px rgba(0,214,143,0.28), inset 0 1px 0 rgba(255,255,255,0.06)',
        }}
      >
        <div
          className="w-6 h-6 rounded-lg flex items-center justify-center shrink-0"
          style={{
            background: 'linear-gradient(135deg, #00d68f, #00a870)',
            boxShadow: '0 0 12px rgba(0,214,143,0.8)',
          }}
        >
          <span style={{ color: '#fff', fontSize: 11, fontWeight: 900, fontFamily: "'Sora', sans-serif", letterSpacing: '-0.05em' }}>
            W
          </span>
        </div>
        <span
          style={{
            color: '#00d68f',
            fontSize: 10,
            fontWeight: 700,
            fontFamily: "'Sora', sans-serif",
            letterSpacing: '0.12em',
            textTransform: 'uppercase',
            textShadow: '0 0 10px rgba(0,214,143,0.9)',
          }}
        >
          W-GESTÃO
        </span>
      </div>

      {/*
        Layout responsivo:
        - Mobile: conteúdo full-width + BottomNav fixo na base
        - Desktop (lg+): conteúdo centralizado max-w-lg com padding lateral
      */}
      <div className="min-h-screen flex justify-center" style={{ background: 'transparent' }}>
        <div className="w-full max-w-lg flex flex-col min-h-screen relative">
          <main className="flex-1 pb-24">{children}</main>
          <BottomNav />
        </div>
      </div>
    </>
  )
}
