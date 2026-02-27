import { useState, useEffect } from 'react';
import { cadastrarParticipante, cpfJaCadastrado, idJaCadastrado } from '../services/participanteService';
import { compressImageAsDataUrl } from '../utils/imageCompress';
import { isValidCPF, formatCPF, cleanCPF } from '../utils/cpfValidator';
import { useSorteio } from '../contexts/SorteioContext';

export function FormularioCadastro() {
  const { sorteio, atualizarTotal } = useSorteio();
  const [formData, setFormData] = useState({
    nome: '',
    cpf: '',
    email: '',
    chavePix: '',
    idUsuario: ''
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [cpfValidando, setCpfValidando] = useState(false);
  const [idValidando, setIdValidando] = useState(false);
  const [uploadedImageUrl, setUploadedImageUrl] = useState('');
  const [uploadingImage, setUploadingImage] = useState(false);

  useEffect(() => {
    const timer = setTimeout(async () => {
      if (formData.cpf && isValidCPF(formData.cpf)) {
        setCpfValidando(true);
        try {
          const cpfLimpo = cleanCPF(formData.cpf);
          const jaExiste = await cpfJaCadastrado(cpfLimpo);
          if (jaExiste) {
            setErrors(prev => ({ ...prev, cpf: 'CPF já cadastrado' }));
          } else {
            setErrors(prev => {
              const newErrors = { ...prev };
              delete newErrors.cpf;
              return newErrors;
            });
          }
        } catch (error) {
          console.error('Erro ao verificar CPF:', error);
        } finally {
          setCpfValidando(false);
        }
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [formData.cpf]);

  useEffect(() => {
    const timer = setTimeout(async () => {
      if (formData.idUsuario && formData.idUsuario.trim().length > 0) {
        setIdValidando(true);
        try {
          const jaExiste = await idJaCadastrado(formData.idUsuario.trim());
          if (jaExiste) {
            setErrors(prev => ({ ...prev, idUsuario: 'ID do usuário já cadastrado' }));
          } else {
            setErrors(prev => {
              const newErrors = { ...prev };
              delete newErrors.idUsuario;
              return newErrors;
            });
          }
        } catch (error) {
          console.error('Erro ao verificar ID:', error);
        } finally {
          setIdValidando(false);
        }
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [formData.idUsuario]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    
    if (name === 'cpf') {
      const cpfLimpo = cleanCPF(value);
      if (cpfLimpo.length <= 11) {
        setFormData(prev => ({ ...prev, [name]: formatCPF(cpfLimpo) }));
        
        if (cpfLimpo.length === 11 && !isValidCPF(cpfLimpo)) {
          setErrors(prev => ({ ...prev, cpf: 'CPF inválido' }));
        } else if (cpfLimpo.length < 11) {
          setErrors(prev => {
            const newErrors = { ...prev };
            delete newErrors.cpf;
            return newErrors;
          });
        }
      }
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
      if (errors[name]) {
        setErrors(prev => {
          const newErrors = { ...prev };
          delete newErrors[name];
          return newErrors;
        });
      }
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.nome.trim()) {
      newErrors.nome = 'Nome é obrigatório';
    }
    if (!formData.cpf.trim()) {
      newErrors.cpf = 'CPF é obrigatório';
    } else if (!isValidCPF(formData.cpf)) {
      newErrors.cpf = 'CPF inválido';
    }
    if (!formData.email.trim()) {
      newErrors.email = 'Email é obrigatório';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Email inválido';
    }
    if (!formData.chavePix.trim()) {
      newErrors.chavePix = 'Chave Pix é obrigatória';
    } else {
      // Verificar se chave PIX é CPF e se é igual ao CPF cadastrado
      const chavePixLimpa = cleanCPF(formData.chavePix);
      const cpfLimpo = cleanCPF(formData.cpf);
      
      // Se a chave PIX tem 11 dígitos, pode ser um CPF
      if (chavePixLimpa.length === 11) {
        if (isValidCPF(chavePixLimpa)) {
          // É um CPF válido, verificar se é igual ao CPF cadastrado
          if (chavePixLimpa !== cpfLimpo) {
            newErrors.chavePix = 'Se a chave PIX for CPF, deve ser igual ao CPF cadastrado';
          }
        }
      }
    }
    if (!formData.idUsuario.trim()) {
      newErrors.idUsuario = 'ID do usuário é obrigatório';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!sorteio || !sorteio.aberto) {
      alert('Cadastros não estão abertos no momento.');
      return;
    }

    if (!validateForm()) {
      return;
    }

    const cpfLimpo = cleanCPF(formData.cpf);
    try {
      const cpfJaExiste = await cpfJaCadastrado(cpfLimpo);
      if (cpfJaExiste) {
        setErrors({ cpf: 'CPF já cadastrado' });
        return;
      }
      
      const idJaExiste = await idJaCadastrado(formData.idUsuario.trim());
      if (idJaExiste) {
        setErrors({ idUsuario: 'ID do usuário já cadastrado' });
        return;
      }
    } catch (error) {
      console.error('Erro ao verificar dados:', error);
      alert('Erro ao verificar dados. Tente novamente.');
      return;
    }

    setLoading(true);
    setSuccess(false);

    try {
      await cadastrarParticipante({
        nome: formData.nome.trim(),
        cpf: cpfLimpo,
        email: formData.email.trim(),
        chavePix: formData.chavePix.trim(),
        idUsuario: formData.idUsuario.trim(),
        fotoContaUrl: uploadedImageUrl || undefined
      });

      setSuccess(true);
      setFormData({
        nome: '',
        cpf: '',
        email: '',
        chavePix: '',
        idUsuario: ''
      });
      setUploadedImageUrl('');
      setErrors({});
      
      try {
        await atualizarTotal();
      } catch (updateError) {
        console.warn('Erro ao atualizar total, mas cadastro foi feito:', updateError);
      }
      
      setTimeout(() => setSuccess(false), 5000);
    } catch (error: any) {
      console.error('Erro ao cadastrar:', error);
      const errorMessage = error?.message || error?.toString() || 'Erro desconhecido';
      
      if (errorMessage.includes('CPF já cadastrado') || errorMessage.includes('já cadastrado')) {
        setErrors({ cpf: 'CPF já cadastrado' });
      } else if (errorMessage.includes('não está aberto') || errorMessage.includes('aberto')) {
        setErrors({});
        alert('Cadastros não estão abertos no momento.');
      } else if (errorMessage.includes('permissão') || errorMessage.includes('permission')) {
        setErrors({});
        alert('Erro de permissão. Verifique as configurações do Firestore.');
      } else {
        setErrors({});
        alert(`Erro ao cadastrar: ${errorMessage}. Verifique se foi salvo.`);
      }
    } finally {
      setLoading(false);
    }
  };

  const sorteioAberto = sorteio?.aberto === true;

  return (
    <div className="max-w-3xl mx-auto">
      <div className="rounded-3xl p-10 shadow-2xl bg-slate-800 border-2 border-amber-400/60 shadow-amber-900/20">
        <div className="text-center mb-10">
          <h2 className="text-5xl font-black mb-4 text-white">🎯 Cadastre-se Agora!</h2>
          {!sorteioAberto && (
            <div className="rounded-2xl p-5 text-amber-100 font-semibold text-lg border-2 border-amber-500/60 bg-slate-700/50">
              ⚠️ Cadastros temporariamente fechados
            </div>
          )}
        </div>

        {success && (
          <div className="rounded-2xl p-6 mb-8 text-center border-2 border-emerald-400/70 bg-emerald-900/30 animate-pulse">
            <div className="text-4xl mb-3">✅</div>
            <div className="text-2xl font-bold text-emerald-300 mb-2">Cadastro realizado com sucesso!</div>
            <div className="text-lg text-emerald-200">Boa sorte! 🍀</div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="nome" className="block text-sm font-bold text-white mb-3 uppercase tracking-wider text-lg">
              👤 Nome Completo *
            </label>
            <input
              type="text"
              id="nome"
              name="nome"
              value={formData.nome}
              onChange={handleChange}
              disabled={!sorteioAberto || loading}
              className={`w-full px-5 py-4 rounded-2xl border-2 text-white placeholder-slate-400 focus:outline-none focus:ring-4 transition-all duration-300 ${
                errors.nome 
                  ? 'border-red-400 focus:border-red-300 focus:ring-red-300/50 bg-red-900/30' 
                  : 'border-amber-400/50 focus:border-amber-400 focus:ring-amber-400/30 bg-slate-700/60'
              } ${
                (!sorteioAberto || loading) && 'opacity-50 cursor-not-allowed bg-slate-700/40'
              }`}
              placeholder="Seu nome completo"
            />
            {errors.nome && (
              <p className="mt-2 text-sm text-red-300 flex items-center gap-2 font-semibold">
                <span>⚠️</span> {errors.nome}
              </p>
            )}
          </div>

          <div>
            <label htmlFor="cpf" className="block text-sm font-bold text-white mb-3 uppercase tracking-wider text-lg">
              🆔 CPF *
            </label>
            <input
              type="text"
              id="cpf"
              name="cpf"
              value={formData.cpf}
              onChange={handleChange}
              disabled={!sorteioAberto || loading}
              className={`w-full px-5 py-4 rounded-2xl border-2 text-white placeholder-slate-400 focus:outline-none focus:ring-4 transition-all duration-300 ${
                errors.cpf 
                  ? 'border-red-400 focus:border-red-300 focus:ring-red-300/50 bg-red-900/30' 
                  : 'border-amber-400/50 focus:border-amber-400 focus:ring-amber-400/30 bg-slate-700/60'
              } ${
                (!sorteioAberto || loading) && 'opacity-50 cursor-not-allowed bg-slate-700/40'
              }`}
              placeholder="000.000.000-00"
              maxLength={14}
            />
            {cpfValidando && (
              <p className="mt-2 text-sm text-amber-300 flex items-center gap-2 font-semibold">
                <span className="animate-spin">⏳</span> Verificando CPF...
              </p>
            )}
            {errors.cpf && (
              <p className="mt-2 text-sm text-red-300 flex items-center gap-2 font-semibold">
                <span>⚠️</span> {errors.cpf}
              </p>
            )}
          </div>

          <div>
            <label htmlFor="email" className="block text-sm font-bold text-white mb-3 uppercase tracking-wider text-lg">
              📧 Email *
            </label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              disabled={!sorteioAberto || loading}
              className={`w-full px-5 py-4 rounded-2xl border-2 text-white placeholder-slate-400 focus:outline-none focus:ring-4 transition-all duration-300 ${
                errors.email 
                  ? 'border-red-400 focus:border-red-300 focus:ring-red-300/50 bg-red-900/30' 
                  : 'border-amber-400/50 focus:border-amber-400 focus:ring-amber-400/30 bg-slate-700/60'
              } ${
                (!sorteioAberto || loading) && 'opacity-50 cursor-not-allowed bg-slate-700/40'
              }`}
              placeholder="seu@email.com"
            />
            {errors.email && (
              <p className="mt-2 text-sm text-red-300 flex items-center gap-2 font-semibold">
                <span>⚠️</span> {errors.email}
              </p>
            )}
          </div>

          <div>
            <label htmlFor="chavePix" className="block text-sm font-bold text-white mb-3 uppercase tracking-wider text-lg">
              💳 Chave Pix *
            </label>
            <input
              type="text"
              id="chavePix"
              name="chavePix"
              value={formData.chavePix}
              onChange={handleChange}
              disabled={!sorteioAberto || loading}
              className={`w-full px-5 py-4 rounded-2xl border-2 text-white placeholder-slate-400 focus:outline-none focus:ring-4 transition-all duration-300 ${
                errors.chavePix 
                  ? 'border-red-400 focus:border-red-300 focus:ring-red-300/50 bg-red-900/30' 
                  : 'border-amber-400/50 focus:border-amber-400 focus:ring-amber-400/30 bg-slate-700/60'
              } ${
                (!sorteioAberto || loading) && 'opacity-50 cursor-not-allowed bg-slate-700/40'
              }`}
              placeholder="CPF, Email, Telefone ou Chave Aleatória"
            />
            {errors.chavePix && (
              <p className="mt-2 text-sm text-red-300 flex items-center gap-2 font-semibold">
                <span>⚠️</span> {errors.chavePix}
              </p>
            )}
          </div>

          <div>
            <label htmlFor="idUsuario" className="block text-sm font-bold text-white mb-3 uppercase tracking-wider text-lg">
              🆔 ID do Usuário *
            </label>
            <input
              type="text"
              id="idUsuario"
              name="idUsuario"
              value={formData.idUsuario}
              onChange={handleChange}
              disabled={!sorteioAberto || loading}
              className={`w-full px-5 py-4 rounded-2xl border-2 text-white placeholder-slate-400 focus:outline-none focus:ring-4 transition-all duration-300 ${
                errors.idUsuario 
                  ? 'border-red-400 focus:border-red-300 focus:ring-red-300/50 bg-red-900/30' 
                  : 'border-amber-400/50 focus:border-amber-400 focus:ring-amber-400/30 bg-slate-700/60'
              } ${
                (!sorteioAberto || loading) && 'opacity-50 cursor-not-allowed bg-slate-700/40'
              }`}
              placeholder="Seu ID na plataforma"
            />
            {idValidando && (
              <p className="mt-2 text-sm text-amber-300 flex items-center gap-2 font-semibold">
                <span className="animate-spin">⏳</span> Verificando ID...
              </p>
            )}
            {errors.idUsuario && (
              <p className="mt-2 text-sm text-red-300 flex items-center gap-2 font-semibold">
                <span>⚠️</span> {errors.idUsuario}
              </p>
            )}
          </div>

          <div>
            <label className="block text-sm font-bold text-white mb-3 uppercase tracking-wider text-lg">
              📷 Print da conta
            </label>
            <label className="flex items-center gap-3 px-5 py-4 rounded-2xl border-2 border-amber-400/50 bg-slate-700/60 text-white cursor-pointer hover:bg-slate-600/60 transition-colors disabled:opacity-50 disabled:cursor-not-allowed w-full">
              <input
                type="file"
                accept="image/*"
                className="sr-only"
                disabled={!sorteioAberto || loading || uploadingImage}
                onChange={async (e) => {
                  const file = e.target.files?.[0];
                  if (!file) return;
                  setUploadingImage(true);
                  try {
                    const dataUrl = await compressImageAsDataUrl(file);
                    setUploadedImageUrl(dataUrl);
                  } catch (err) {
                    console.error('Erro ao processar imagem:', err);
                    alert('Erro ao processar imagem. Tente outra imagem.');
                  } finally {
                    setUploadingImage(false);
                    e.target.value = '';
                  }
                }}
              />
              {uploadingImage ? '⏳ Enviando...' : '📤 Enviar imagem'}
              {uploadedImageUrl && (
                <span className="text-sm text-emerald-300">✓ Imagem enviada</span>
              )}
            </label>
          </div>

          <button
            type="submit"
            disabled={!sorteioAberto || loading}
            className="w-full py-5 px-8 bg-amber-500 hover:bg-amber-400 text-slate-900 font-black text-xl rounded-2xl shadow-2xl shadow-amber-900/30 uppercase tracking-wider disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:transform-none transition-colors"
          >
            {loading ? '⏳ Cadastrando...' : '💰 Participar da Gorjeta'}
          </button>
        </form>
      </div>
    </div>
  );
}
