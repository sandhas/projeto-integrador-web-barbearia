import { getCategories } from '@/lib/actions'
import CategoriesClient from '@/components/CategoriesClient'

export default async function CategoriasPage() {
  const categories = await getCategories()

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-white">Categorias</h1>
        <p className="text-zinc-400 text-sm mt-1">
          Gerencie as categorias de receitas e despesas
        </p>
      </div>

      <CategoriesClient categories={categories} />
    </div>
  )
}
