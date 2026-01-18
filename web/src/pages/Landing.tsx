import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { doc, getDoc, setDoc } from 'firebase/firestore'
import { db } from '@/lib/firebase'
import { Search } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent } from '@/components/ui/card'
import { CountryMultiSelect } from '@/components/CountryMultiSelect'
import { useAuth } from '@/hooks/useAuth'
import { savePendingSearch, getSessionId } from '@/services/pendingSearch'

export function LandingPage() {
  const navigate = useNavigate()
  const { user } = useAuth()
  
  const [molecule, setMolecule] = useState('')
  const [brand, setBrand] = useState('')
  const [countries, setCountries] = useState<string[]>(['BR'])
  
  // VERIFICAR FIRESTORE QUANDO USER CARREGA
  useEffect(() => {
    if (user) {
      checkFirestoreAndAutoExecute()
    }
  }, [user])
  
  const checkFirestoreAndAutoExecute = async () => {
    try {
      console.log('🔍 [LANDING] Checking Firestore for pending search')
      
      const userDoc = await getDoc(doc(db, 'users', user!.uid))
      
      if (!userDoc.exists()) {
        console.log('⚠️ [LANDING] User doc not found')
        return
      }
      
      const userData = userDoc.data()
      const pendingSearch = userData.pendingSearch
      
      if (!pendingSearch) {
        console.log('ℹ️ [LANDING] No pending search in Firestore')
        return
      }
      
      console.log('✅ [LANDING] Found pending search:', pendingSearch)
      
      // LIMPAR pending search IMEDIATAMENTE para evitar loop
      await setDoc(doc(db, 'users', user!.uid), {
        pendingSearch: null,
        lastExecutedAt: new Date()
      }, { merge: true })
      
      console.log('🚀 [LANDING] Auto-executing search')
      
      // Executar busca
      navigate('/search', {
        state: {
          molecule: pendingSearch.molecule,
          brand: pendingSearch.brand || '',
          countries: pendingSearch.countries
        }
      })
      
    } catch (error) {
      console.error('[LANDING] Error checking Firestore:', error)
    }
  }

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!molecule.trim()) {
      alert('Digite o nome da molécula!')
      return
    }

    // Se user NÃO logado → salvar e ir pro login
    if (!user) {
      console.log('⚠️ User NOT logged in - saving to Firestore and redirecting')
      
      const sessionId = getSessionId()
      savePendingSearch(sessionId, {
        molecule: molecule.trim(),
        brand: brand.trim(),
        countries: countries
      })
      
      navigate('/login')
      return
    }

    // Se user logado → executar busca
    console.log('✅ User logged in, navigating to /search')
    
    navigate('/search', { 
      state: { 
        molecule: molecule.trim(), 
        brand: brand.trim(),
        countries: countries
      } 
    })
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <header className="border-b border-border">
        <div className="container mx-auto px-4 h-16 flex items-center justify-end gap-4">
          {user && (
            <span className="text-sm text-muted-foreground">
              Olá, <span className="font-medium text-foreground">{user.displayName || user.email}</span>
            </span>
          )}
        </div>
      </header>

      <main className="flex-1 flex items-center justify-center px-4 py-16">
        <div className="w-full max-w-2xl space-y-8">
          <div className="text-center space-y-4">
            <img 
              src="/logo.png" 
              alt="Pharmyrus" 
              className="h-16 w-auto mx-auto"
            />
            <h1 className="text-4xl font-bold tracking-tight text-foreground">
              Pharmyrus FTO
            </h1>
            <p className="text-muted-foreground text-lg">
              Análise de Freedom to Operate para Farmacêuticas
            </p>
          </div>

          <Card className="border-border shadow-sm">
            <CardContent className="pt-6">
              <form onSubmit={handleSearch} className="space-y-4">
                <div className="space-y-2">
                  <Input
                    type="text"
                    placeholder="Nome da molécula (ex: darolutamide)"
                    value={molecule}
                    onChange={(e) => setMolecule(e.target.value)}
                    className="h-12 text-base"
                    autoFocus
                  />
                </div>

                <div className="space-y-2">
                  <Input
                    type="text"
                    placeholder="Nome comercial (opcional)"
                    value={brand}
                    onChange={(e) => setBrand(e.target.value)}
                    className="h-12 text-base"
                  />
                </div>

                <div className="space-y-2">
                  <CountryMultiSelect
                    value={countries}
                    onChange={setCountries}
                  />
                </div>

                <Button 
                  type="submit" 
                  className="w-full h-12 text-base gap-2"
                  size="lg"
                >
                  <Search className="h-5 w-5" />
                  Buscar Patentes
                </Button>
              </form>
            </CardContent>
          </Card>

          <div className="text-sm text-muted-foreground space-y-2">
            <p>
              Dados agregados de 4 fontes oficiais • Análise preditiva com IA • 
              Visualização de Patent Cliff
            </p>
          </div>
        </div>
      </main>
    </div>
  )
}
