import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router'
import Nav from '../components/Nav'
import PostsForm from '../components/PostsForm'
import ConfirmModal from '../components/ConfirmModal'

const Posts = () => {
  const [posts, setPosts] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('') 
  const [users, setUsers] = useState([])
  const [searchTerm, setSearchTerm] = useState('')
  const [currentPage, setCurrentPage] = useState(1) 
  const itemsPerPage = 5

  const [showPostsForm, setShowPostsForm] = useState(false)
  const [postsSubmitting, setPostsSubmitting] = useState(false)
  const [postsError, setPostsError] = useState('')
  const [postsSuccess, setPostsSuccess] = useState('')
  const [editingPost, setEditingPost] = useState(null)
  const [loadingPostDetail, setLoadingPostDetail] = useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false) 
  const [postToDelete, setPostToDelete] = useState(null) 

  const navigate = useNavigate()
  
  const token = localStorage.getItem('fakestore_token') || sessionStorage.getItem('fakestore_token')

  const filteredPosts = posts.filter((post) => {
    const query = searchTerm.trim().toLowerCase()
    if (!query) return true
    
    return [ post.userId, post.title, post.body]
      .join(' ')
      .toLowerCase()
      .includes(query)
  })

  // CÁLCULOS DE PAGINACIÓN
  // Math.ceil divide el total de posts entre 5 y lo redondea hacia arriba (Ej: 21 posts / 5 = 5 páginas)
  const totalPages = Math.max(1, Math.ceil(filteredPosts.length / itemsPerPage))
  const startIndex = (currentPage - 1) * itemsPerPage
  const currentPosts = filteredPosts.slice(startIndex, startIndex + itemsPerPage)

  // CARGA INICIAL DE DATOS ---
  useEffect(() => {
    // Protección de ruta: Si no hay token, el usuario es expulsado inmediatamente al login
    if (!token) {
      navigate('/')
      return
    }

    const fetchPosts = async () => {
      try {
        const localSavedData = localStorage.getItem('my_posts')
        
        if (localSavedData) {
          setPosts(JSON.parse(localSavedData))
        } else {
          const response = await fetch('https://jsonplaceholder.typicode.com/posts')
          if (!response.ok) throw new Error('Error al cargar los publicaciones del servidor')

          const data = await response.json()
          
          const initialPosts = data.map((post) => ({ ...post, source: 'api' }))
          
          localStorage.setItem('my_', JSON.stringify(initialPosts))
          setPosts(initialPosts)
        }
      } catch (err) {
        setError(err.message || 'No se pudieron cargar las publicaciones')
      } finally {
        setLoading(false)
      }
    }

    const fetchUserIds = async () => {
      try {
        const response = await fetch('https://jsonplaceholder.typicode.com/users')
        if (!response.ok) {
          throw new Error('Error al cargar los usuarios')
        }

        const data = await response.json()
        setUsers(data)
      } catch (err) {
        console.warn(err)
      }
    }

    fetchPosts()
    fetchUserIds()
  }, [navigate, token])

  const handlePageChange = (page) => setCurrentPage(page)

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value)
    setCurrentPage(1)
  }

  const handleEditPost = async (id) => {
    setPostsError('')
    setLoadingPostDetail(true)

    const postToEdit = posts.find((post) => post.id === id)
    
    if (postToEdit) {
      setEditingPost(postToEdit) 
      setShowPostsForm(true)
      setLoadingPostDetail(false)
    } else {
      setPostsError('No se encontró la publicación solicitada.')
      setLoadingPostDetail(false)
    }
  }

  const handleUpdatePost = async (formData) => {
    setPostsError('')
    setPostsSuccess('')
    setPostsSubmitting(true)

    try {
      const updatedList = posts.map((p) =>
        p.id === editingPost.id 
          ? { ...p, ...formData, source: p.source } 
          : p
      )

      localStorage.setItem('my_posts', JSON.stringify(updatedList))
      
      setPosts(updatedList)
      
      setPostsSuccess('Prublicación actualizada con éxito localmente.')
      setShowPostsForm(false)
      setEditingPost(null)
    } catch (err) {
      setPostsError('No se pudo guardar la actualización.')
    } finally {
      setPostsSubmitting(false)
    }
  }

  const handleCreatePost = async (formData) => {
    setPostsError('')
    setPostsSuccess('')
    setPostsSubmitting(true)

    try {
      const nextId = posts.length > 0 ? Math.max(...posts.map(p => p.id)) + 1 : 1

      const newPost = {
        ...formData,               
        id: nextId,
        userId: Math.floor(Math.random() * 10) + 1,              
        source: 'local',          
        rating: { rate: 0, count: 0 }
      }

      const updatedList = [newPost, ...posts]

      localStorage.setItem('my_posts', JSON.stringify(updatedList))
      setPosts(updatedList)

      setPostsSuccess(`Publicación creado localmente con éxito. ID: ${nextId}`)
      setShowPostsForm(false)
      setCurrentPage(1) 
    } catch (err) {
      setPostsError('Error al guardar el nuevo post.')
    } finally {
      setPostsSubmitting(false)
    }
  }

  const handleDeletePost = (id) => {
    setPostToDelete(id)
    setShowDeleteConfirm(true)
  }

  const confirmDeletePost = () => {
    if (!postToDelete) return

    setPostsError('')
    setPostsSuccess('')
    setShowDeleteConfirm(false)

    try {
      const updatedList = posts.filter((p) => p.id !== postToDelete)


      localStorage.setItem('my_posts', JSON.stringify(updatedList))
      setPosts(updatedList)

      setPostsSuccess('Publicación eliminada permanentemente de tu almacenamiento.')
    } catch (err) {
      setPostsError('No se pudo eliminar la publicación de forma local.')
    } finally {
      setPostToDelete(null) 
    }
  }

  const cancelDeletePost = () => {
    setShowDeleteConfirm(false)
    setPostToDelete(null)
  }

  return (
    <div className="min-h-screen bg-white">
      {token && <Nav />}

      <main className="max-w-6xl mx-auto p-4 md:p-6">
        {/* Encabezado Principal */}
        <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8 bg-white p-6 rounded-xl shadow-sm border border-slate-100">
          <div>
            <h1 className="text-2xl font-bold text-teal-600">Catálogo de Publicaciones</h1>
            <p className="text-sm text-slate-500 font-medium">Gestión Profesional de Publicaciones</p>
          </div>
          <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
            <div className="bg-slate-50 border border-slate-100 px-4 py-2 rounded-lg text-right hidden sm:block">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Total</p>
              <p className="text-sm font-bold text-slate-700">{filteredPosts.length} items</p>
            </div>
            <button
              type="button"
              onClick={() => {
                setEditingPost(null);
                setShowPostsForm((s) => !s);
              }}
              className="w-full sm:w-auto bg-teal-600 hover:bg-teal-700 text-white px-4 py-2.5 rounded-lg text-sm font-bold transition-all shadow-sm shadow-teal-100"
            >
              Nueva Publicación +
            </button>
          </div>
        </header>

        {/* Buscador */}
        <div className="mb-6 w-full"> 
          <label htmlFor="post-search" className="sr-only">Buscar publicaciones</label>
          <input
            id="post-search"
            type="text"
            value={searchTerm}
            onChange={handleSearchChange}
            placeholder="Buscar por título o contenido..."
            className="w-full rounded-lg border border-slate-200 bg-white px-4 py-3 text-slate-900 text-sm outline-none shadow-sm focus:border-teal-500 focus:ring-2 focus:ring-teal-100 transition-all"
          />
        </div>

        {/* Alertas de Estado */}
        {postsError && <div className="mb-4 rounded-lg bg-rose-50 border border-rose-100 px-4 py-3 text-sm font-medium text-rose-700">{postsError}</div>}
        {postsSuccess && <div className="mb-4 rounded-lg bg-emerald-50 border border-emerald-100 px-4 py-3 text-sm font-medium text-emerald-700">{postsSuccess}</div>}

        {/* Formularios y Modales */}
        {showPostsForm && (
          <PostsForm
            initialData={editingPost || {}}
             userIds={users}
            onSubmit={editingPost ? handleUpdatePost : handleCreatePost}
            submitting={postsSubmitting || loadingPostDetail}
            onClose={() => {
              setShowPostsForm(false);
              setEditingPost(null);
            }}
          />
        )}

        <ConfirmModal
          title="Confirmar eliminación"
          message="¿Estás seguro de que deseas eliminar esta publicación? Esta acción no se puede deshacer."
          isOpen={showDeleteConfirm}
          isDangerous={true}
          onConfirm={confirmDeletePost}
          onCancel={cancelDeletePost}
        />

        {/* Tabla */}
        <div className="bg-white rounded-xl shadow-sm overflow-hidden border border-slate-100">
          {loading ? (
            <div className="flex items-center justify-center py-20 text-slate-500 font-medium text-sm">Cargando publicaciones...</div>
          ) : error ? (
            <div className="m-4 rounded-lg bg-rose-50 p-6 text-sm text-rose-700 border border-rose-100">{error}</div>
          ) : (
            <>
              {/* VISTA PARA MÓVILES */}
              <div className="block md:hidden divide-y divide-slate-100">
                {currentPosts.map((post) => (
                  <div key={post.id} className="p-4 space-y-3 hover:bg-teal-50/10 transition-colors">
                    <div>
                      <span className="inline-block text-[10px] bg-slate-100 text-slate-600 px-2 py-0.5 rounded font-bold uppercase tracking-wider mb-1">
                        {post.userId}
                      </span>
                      <h3 className="font-bold text-slate-800 line-clamp-1">{post.title}</h3>
                      <p className="text-xs text-slate-500 line-clamp-2 mt-1">{post.body}</p>
                    </div>
                    <div className="flex justify-between items-center pt-2">
                      <div className="flex gap-3 text-xs font-bold">
                        <button
                          onClick={() => handleEditPost(post.id)}
                          disabled={loadingPostDetail}
                          className="text-teal-600 hover:text-teal-800 disabled:text-slate-400"
                        >
                          Editar
                        </button>
                        <button
                          onClick={() => handleDeletePost(post.id)}
                          className="text-red-500 hover:text-red-700"
                        >
                          Eliminar
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* VISTA PARA ESCRITORIO */}
              <div className="hidden md:block overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead className="bg-slate-50 text-slate-500 text-xs uppercase tracking-wider border-b border-slate-100">
                    <tr>
                      <th className="p-4 font-bold max-w-[280px]">Título / ID User</th>
                      <th className="p-8 font-bold max-w-[350px]">Contenido</th>
                      <th className="p-4 font-bold text-right"></th>
                      <th className="p-4 font-bold text-center">Acciones</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-sm">
                    {currentPosts.map((post) => (
                      <tr key={post.id} className="hover:bg-teal-50/20 transition-colors">
                        {/* Título y User ID */}
                        <td className="p-4 align-middle">
                          <div className="font-bold text-slate-800 line-clamp-1 max-w-[260px]">{post.title}</div>
                          <div className="text-xs text-teal-600 font-semibold mt-0.5"> ID USER: {post.userId}</div>
                        </td>
                        {/* Contenido con límite de líneas */}
                        <td className="p-4 align-middle text-slate-500 max-w-[350px]">
                          <p className="line-clamp-2 leading-relaxed" title={post.body}>
                            {post.body}
                          </p>
                        </td>
                        <td className="p-4 align-middle text-right font-bold text-slate-900 whitespace-nowrap">
                        </td>
                        {/* Acciones */}
                        <td className="p-4 align-middle">
                          <div className="flex justify-center gap-4 text-xs font-bold">
                            <button
                              type="button"
                              onClick={() => handleEditPost(post.id)}
                              disabled={loadingPostDetail}
                              className="text-teal-600 hover:text-teal-800 transition-colors disabled:cursor-not-allowed disabled:text-slate-400"
                            >
                              Editar
                            </button>
                            <button
                              type="button"
                              onClick={() => handleDeletePost(post.id)}
                              className="text-red-400 hover:text-red-600 transition-colors"
                            >
                              Eliminar
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Paginación */}
              <div className="p-4 border-t border-slate-100 bg-slate-50/50 flex flex-col sm:flex-row gap-4 items-center justify-between">
                <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  Página {currentPage} de {totalPages}
                </span>

                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => handlePageChange(Math.max(1, currentPage - 1))}
                    disabled={currentPage === 1}
                    className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-bold text-slate-600 transition-colors hover:bg-slate-50 disabled:cursor-not-allowed disabled:bg-slate-100 disabled:text-slate-300"
                  >
                    ← Ant
                  </button>

                  {/* Páginas */}
                  <div className="flex items-center gap-1">
                    {[...Array(totalPages)].map((_, index) => {
                      const page = index + 1;
                      const isCurrent = currentPage === page;
                      return (
                        <button
                          key={page}
                          type="button"
                          onClick={() => handlePageChange(page)}
                          className={`rounded-lg px-3 py-1.5 text-xs font-bold transition-all ${isCurrent
                            ? 'bg-teal-600 text-white shadow-sm shadow-teal-100'
                            : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
                            }`}
                        >
                          {page}
                        </button>
                      );
                    })}
                  </div>

                  <button
                    type="button"
                    onClick={() => handlePageChange(Math.min(totalPages, currentPage + 1))}
                    disabled={currentPage === totalPages}
                    className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-bold text-slate-600 transition-colors hover:bg-slate-50 disabled:cursor-not-allowed disabled:bg-slate-100 disabled:text-slate-300"
                  >
                    Sig →
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </main>
    </div>
  )
}
export default Posts