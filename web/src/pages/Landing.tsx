import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Search } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent } from '@/components/ui/card'
import { CountryMultiSelect } from '@/components/CountryMultiSelect'
import { useAuth } from '@/hooks/useAuth'

export function LandingPage() {
  const navigate = useNavigate()
  const { user } = useAuth()
  
  // CARREGAR DO LOCALSTORAGE
  const [molecule, setMolecule] = useState('')
  const [brand, setBrand] = useState('')
  const [countries, setCountries] = useState<string[]>(['BR'])
  
  // CARREGAR DADOS SALVOS
  useEffect(() => {
    const savedMolecule = localStorage.getItem('pendingSearch_molecule')
    const savedBrand = localStorage.getItem('pendingSearch_brand')
    const savedCountries = localStorage.getItem('pendingSearch_countries')
    
    if (savedMolecule) {
      console.log('✅ [LANDING] Loading saved search from localStorage')
      setMolecule(savedMolecule)
      setBrand(savedBrand || '')
      setCountries(savedCountries ? JSON.parse(savedCountries) : ['BR'])
      
      // Se user logado, executar automaticamente
      if (user) {
        console.log('🚀 [LANDING] User logged in, auto-executing saved search')
        
        // Limpar localStorage
        localStorage.removeItem('pendingSearch_molecule')
        localStorage.removeItem('pendingSearch_brand')
        localStorage.removeItem('pendingSearch_countries')
        
        // Executar busca
        setTimeout(() => {
          navigate('/search', {
            state: {
              molecule: savedMolecule,
              brand: savedBrand || '',
              countries: savedCountries ? JSON.parse(savedCountries) : ['BR']
            }
          })
        }, 500)
      }
    }
  }, [user, navigate])

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!molecule.trim()) {
      alert('Digite o nome da molécula!')
      return
    }

    // SALVAR NO LOCALSTORAGE
    localStorage.setItem('pendingSearch_molecule', molecule.trim())
    localStorage.setItem('pendingSearch_brand', brand.trim())
    localStorage.setItem('pendingSearch_countries', JSON.stringify(countries))
    
    console.log('💾 [LANDING] Saved search to localStorage')

    if (!user) {
      console.log('⚠️ [LANDING] User not logged in, redirecting to login')
      navigate('/login')
      return
    }

    console.log('✅ [LANDING] User logged in, executing search')
    
    // Limpar localStorage
    localStorage.removeItem('pendingSearch_molecule')
    localStorage.removeItem('pendingSearch_brand')
    localStorage.removeItem('pendingSearch_countries')
    
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
