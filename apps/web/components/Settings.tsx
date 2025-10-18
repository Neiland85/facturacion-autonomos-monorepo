import React, { useState, useRef, useEffect, useCallback } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { SubscriptionTier, UserProfile, View, CreditCard, Company } from '../types';
import { UserCircleIcon, CreditCardIcon, LockClosedIcon, DiamondIcon, CameraIcon, ShieldCheckIcon, LaptopIcon, DeviceMobileIcon, UserIcon, PlusIcon, TrashIcon } from './icons';
import { useSound } from '../hooks/useSound';
import CancelSubscriptionModal from './CancelSubscriptionModal';
import CameraModal from './CameraModal';
import { createCompany, getMyCompany, updateCompany, UpsertCompanyPayload } from '../services/apiService';

interface SettingsProps {
  subscriptionTier: SubscriptionTier;
  userProfile: UserProfile | null;
  onLogout: () => void;
  onCancelSubscription: () => void;
  setView: (view: View) => void;
}

type SettingsSection = 'profile' | 'security' | 'subscription' | 'payment';

const mockSessions = [
    { id: 1, device: 'Chrome en Windows', location: 'Madrid, España', lastActivity: 'Ahora mismo', icon: LaptopIcon, isCurrent: true },
    { id: 2, device: 'iPhone 15 Pro', location: 'Barcelona, España', lastActivity: 'Hace 2 horas', icon: DeviceMobileIcon, isCurrent: false },
];

const mockAuditLog = [
    { id: 1, action: 'Factura INV-005 creada', user: 'Tú', timestamp: '2024-07-21 10:30:15' },
    { id: 2, action: 'Contraseña cambiada', user: 'Tú', timestamp: '2024-07-20 18:05:02' },
];

const Settings: React.FC<SettingsProps> = ({ subscriptionTier, userProfile, onLogout, onCancelSubscription, setView }) => {
    const { playSound } = useSound();
    const queryClient = useQueryClient();
    const [activeSection, setActiveSection] = useState<SettingsSection>('profile');
    const [isCancelModalOpen, setIsCancelModalOpen] = useState(false);
    const [profilePicture, setProfilePicture] = useState<string | null>(null);
    const [isCameraModalOpen, setIsCameraModalOpen] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [is2faEnabled, setIs2faEnabled] = useState(false);
    const [sessions, setSessions] = useState(mockSessions);
    const [contactImportMessage, setContactImportMessage] = useState<string | null>(null);


    // --- Payment Methods State ---
    const [cards, setCards] = useState<CreditCard[]>([
        { id: 'card-1', cardholderName: 'Mi Empresa Creativa S.L.', last4: '4242', expiryDate: '12/26', cardType: 'visa', isDefault: true },
        { id: 'card-2', cardholderName: 'Mi Empresa Creativa S.L.', last4: '5555', expiryDate: '08/25', cardType: 'mastercard', isDefault: false },
    ]);
    const [showAddCardForm, setShowAddCardForm] = useState(false);
    const [newCard, setNewCard] = useState({ cardholderName: '', cardNumber: '', expiryDate: '', cvv: '' });
    const [cardErrors, setCardErrors] = useState({ cardholderName: '', cardNumber: '', expiryDate: '', cvv: '' });

    const { data: company, isLoading: isCompanyLoading, isError: isCompanyError } = useQuery<Company>({
        queryKey: ['company', 'me'],
        queryFn: getMyCompany,
        retry: false,
    });

    const [companyForm, setCompanyForm] = useState<UpsertCompanyPayload>({
        name: '',
        cif: '',
        address: '',
        city: '',
        postalCode: '',
        province: '',
        phone: '',
        email: '',
        website: '',
        taxRegime: 'GENERAL',
    });
    const [companyFormError, setCompanyFormError] = useState<string | null>(null);
    const [companyFormSuccess, setCompanyFormSuccess] = useState<string | null>(null);

    useEffect(() => {
        if (company) {
            setCompanyForm({
                name: company.name,
                cif: company.cif,
                address: company.address,
                city: company.city,
                postalCode: company.postalCode,
                province: company.province,
                phone: company.phone ?? '',
                email: company.email ?? '',
                website: company.website ?? '',
                taxRegime: company.taxRegime ?? 'GENERAL',
            });
        }
    }, [company]);

    const companyMutation = useMutation<Company, unknown, UpsertCompanyPayload>({
        mutationFn: (payload) => (company ? updateCompany(payload) : createCompany(payload)),
        onSuccess: (updatedCompany) => {
            queryClient.setQueryData(['company', 'me'], updatedCompany);
            setCompanyFormSuccess(company ? 'Datos de empresa actualizados correctamente.' : 'Empresa registrada correctamente.');
            setCompanyFormError(null);
            playSound('success');
        },
        onError: (error) => {
            console.error('Error al guardar la empresa:', error);
            setCompanyFormError('No se pudieron guardar los datos de la empresa. Revisa los campos e inténtalo de nuevo.');
            setCompanyFormSuccess(null);
            playSound('error');
        },
    });

    const handleUpgradeClick = () => {
        playSound('click');
        setView('pricing');
    }

    const handleOpenCancelModal = () => {
        playSound('open');
        setIsCancelModalOpen(true);
    };
    
    const handleConfirmCancel = () => {
        onCancelSubscription();
        setIsCancelModalOpen(false);
    }
    
    const handleUploadClick = () => {
        fileInputRef.current?.click();
    };

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setProfilePicture(reader.result as string);
                playSound('success');
            };
            reader.readAsDataURL(file);
        }
    };
    
    const handleTakePhotoClick = () => {
        if (subscriptionTier === 'free') {
            handleUpgradeClick();
        } else {
            playSound('open');
            setIsCameraModalOpen(true);
        }
    };

    const handlePhotoCapture = (imageDataUrl: string) => {
        setProfilePicture(imageDataUrl);
        setIsCameraModalOpen(false);
        playSound('success');
    };
    
    const handleEndSession = (sessionId: number) => {
        playSound('close');
        setSessions(prev => prev.filter(s => s.id !== sessionId));
    };

    const handleImportContacts = async () => {
        setContactImportMessage(null);
        playSound('click');
    
        if (!('contacts' in navigator && 'ContactsManager' in window)) {
            setContactImportMessage('Tu navegador no es compatible con esta función. Prueba desde un dispositivo móvil o un navegador de escritorio actualizado.');
            playSound('error');
            return;
        }
    
        try {
            const props = ['name', 'email', 'tel'];
            const contacts = await (navigator as any).contacts.select(props, { multiple: true });
    
            if (contacts.length > 0) {
                // In a real app, you would send `contacts` to your backend here to create clients.
                console.log('Imported contacts:', contacts);
                setContactImportMessage(`¡Éxito! Se han importado ${contacts.length} contactos.`);
                playSound('success');
            } else {
                setContactImportMessage('No se seleccionó ningún contacto.');
            }
        } catch (ex) {
            setContactImportMessage('Se canceló la importación de contactos.');
            console.error(ex);
        }
    };

    // --- Credit Card Validation Logic ---
    const luhnCheck = (val: string) => {
        let sum = 0;
        let shouldDouble = false;
        for (let i = val.length - 1; i >= 0; i--) {
            let digit = parseInt(val.charAt(i), 10);
            if (shouldDouble) {
                if ((digit *= 2) > 9) digit -= 9;
            }
            sum += digit;
            shouldDouble = !shouldDouble;
        }
        return (sum % 10) === 0;
    };

    const validateCard = useCallback((card: typeof newCard) => {
        const errors = { cardholderName: '', cardNumber: '', expiryDate: '', cvv: '' };
        
        if (!card.cardholderName.trim()) errors.cardholderName = 'El nombre del titular es obligatorio.';
        
        const cardNumberRaw = card.cardNumber.replace(/\s/g, '');
        if (!/^\d+$/.test(cardNumberRaw) || cardNumberRaw.length < 13 || cardNumberRaw.length > 19 || !luhnCheck(cardNumberRaw)) {
            errors.cardNumber = 'El número de tarjeta no es válido.';
        }
        
        const expiryRaw = card.expiryDate.replace(' / ', '');
        if (!/^\d{4}$/.test(expiryRaw)) {
             errors.expiryDate = 'El formato debe ser MM / AA.';
        } else {
            const month = parseInt(expiryRaw.substring(0, 2), 10);
            const year = parseInt(expiryRaw.substring(2, 4), 10);
            const currentYear = new Date().getFullYear() % 100;
            const currentMonth = new Date().getMonth() + 1;
            
            if (month < 1 || month > 12 || (year < currentYear) || (year === currentYear && month < currentMonth)) {
                errors.expiryDate = 'La tarjeta ha caducado o la fecha es inválida.';
            }
        }
        
        if (!/^\d{3,4}$/.test(card.cvv)) errors.cvv = 'El CVV debe tener 3 o 4 dígitos.';

        setCardErrors(errors);
    }, []);

    useEffect(() => {
        validateCard(newCard);
    }, [newCard, validateCard]);

    const handleCardChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        let formattedValue = value;

        if (name === 'cardNumber') {
            formattedValue = value.replace(/\D/g, '').replace(/(\d{4})(?=\d)/g, '$1 ').trim();
        } else if (name === 'expiryDate') {
            formattedValue = value.replace(/\D/g, '').replace(/(\d{2})(?=\d)/, '$1 / ').slice(0, 7);
        } else if (name === 'cvv') {
            formattedValue = value.replace(/\D/g, '').slice(0, 4);
        }
        
        setNewCard(prev => ({ ...prev, [name]: formattedValue }));
    };
    
    const isCardFormValid = Object.values(cardErrors).every(err => err === '') && Object.values(newCard).every(val => typeof val === 'string' && val.trim() !== '');

    const handleCompanyInputChange = (event: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = event.target;
        setCompanyForm(prev => ({ ...prev, [name]: value }));
        setCompanyFormError(null);
        setCompanyFormSuccess(null);
    };

    const handleCompanySubmit = (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();

        const requiredFields: Array<keyof UpsertCompanyPayload> = ['name', 'cif', 'address', 'city', 'postalCode', 'province'];
        const missingField = requiredFields.find((field) => !companyForm[field] || (companyForm[field] as string).trim() === '');

        if (missingField) {
            setCompanyFormError('Completa los campos obligatorios (nombre, CIF y dirección completa).');
            setCompanyFormSuccess(null);
            playSound('error');
            return;
        }

        companyMutation.mutate(companyForm);
    };

    const handleAddCard = (e: React.FormEvent) => {
        e.preventDefault();
        if (isCardFormValid) {
            const newCardData: CreditCard = {
                id: `card-${Date.now()}`,
                cardholderName: newCard.cardholderName,
                last4: newCard.cardNumber.slice(-4),
                expiryDate: newCard.expiryDate.replace(' / ', '/'),
                cardType: 'visa', // Mock type detection
                isDefault: false,
            };
            setCards(prev => [...prev, newCardData]);
            setShowAddCardForm(false);
            setNewCard({ cardholderName: '', cardNumber: '', expiryDate: '', cvv: '' });
            playSound('success');
        } else {
            playSound('error');
        }
    };

    const renderSection = () => {
        const isFreeTier = subscriptionTier === 'free';
        switch (activeSection) {
            case 'profile': {
                const companyInputClasses = "w-full bg-slate-100 dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-lg px-3 py-2 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-orange-500";
                const companyLabelClasses = "block text-sm font-medium text-slate-700 dark:text-slate-300";

                return (
                    <div className="space-y-6">
                        <div className="bg-white dark:bg-slate-800 p-6 rounded-xl border border-slate-200 dark:border-slate-700">
                             <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-4">Perfil de Usuario</h3>
                             <div className="flex flex-col sm:flex-row items-center gap-4 text-center sm:text-left">
                                {profilePicture ? (
                                    <img src={profilePicture} alt="Foto de perfil" className="w-20 h-20 rounded-full object-cover flex-shrink-0" />
                                ) : (
                                    <UserCircleIcon className="w-20 h-20 text-slate-300 dark:text-slate-600 flex-shrink-0" />
                                )}
                                <div className="flex-1">
                                    <p className="font-semibold text-slate-700 dark:text-slate-300">Logo / Foto de Perfil</p>
                                    <div className="flex gap-2 mt-2 justify-center sm:justify-start">
                                        <input type="file" ref={fileInputRef} onChange={handleFileChange} accept="image/png, image/jpeg" className="hidden"/>
                                        <button onClick={handleUploadClick} className="text-sm bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 font-semibold py-1.5 px-3 rounded-lg">Subir Imagen</button>
                                        <button 
                                            onClick={handleTakePhotoClick} 
                                            className="relative group text-sm bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 font-semibold py-1.5 px-3 rounded-lg flex items-center gap-1.5"
                                        >
                                            <CameraIcon className="w-4 h-4" />
                                            Hacer Foto
                                            {isFreeTier && (
                                                <span className="absolute -top-1.5 -right-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-amber-500 text-white shadow">
                                                    <DiamondIcon className="w-2.5 h-2.5"/>
                                                </span>
                                            )}
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="bg-white dark:bg-slate-800 p-6 rounded-xl border border-slate-200 dark:border-slate-700">
                            <h3 className="text-lg font-bold text-slate-900 dark:text-white">Datos fiscales de la empresa</h3>
                            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Esta información se usará en el PDF y en los envíos a tus clientes.</p>
                            {isCompanyLoading ? (
                                <p className="mt-4 text-sm text-slate-500 dark:text-slate-400">Cargando datos de empresa...</p>
                            ) : (
                                <form onSubmit={handleCompanySubmit} className="mt-4 space-y-4">
                                    <div className="grid md:grid-cols-2 gap-4">
                                        <div>
                                            <label className={companyLabelClasses}>Nombre fiscal *</label>
                                            <input name="name" value={companyForm.name} onChange={handleCompanyInputChange} className={companyInputClasses} required />
                                        </div>
                                        <div>
                                            <label className={companyLabelClasses}>CIF *</label>
                                            <input name="cif" value={companyForm.cif} onChange={handleCompanyInputChange} className={companyInputClasses} required />
                                        </div>
                                    </div>
                                    <div>
                                        <label className={companyLabelClasses}>Dirección *</label>
                                        <input name="address" value={companyForm.address} onChange={handleCompanyInputChange} className={companyInputClasses} required />
                                    </div>
                                    <div className="grid md:grid-cols-3 gap-4">
                                        <div>
                                            <label className={companyLabelClasses}>Ciudad *</label>
                                            <input name="city" value={companyForm.city} onChange={handleCompanyInputChange} className={companyInputClasses} required />
                                        </div>
                                        <div>
                                            <label className={companyLabelClasses}>Provincia *</label>
                                            <input name="province" value={companyForm.province} onChange={handleCompanyInputChange} className={companyInputClasses} required />
                                        </div>
                                        <div>
                                            <label className={companyLabelClasses}>Código Postal *</label>
                                            <input name="postalCode" value={companyForm.postalCode} onChange={handleCompanyInputChange} className={companyInputClasses} required />
                                        </div>
                                    </div>
                                    <div className="grid md:grid-cols-3 gap-4">
                                        <div>
                                            <label className={companyLabelClasses}>Teléfono</label>
                                            <input name="phone" value={companyForm.phone ?? ''} onChange={handleCompanyInputChange} className={companyInputClasses} />
                                        </div>
                                        <div>
                                            <label className={companyLabelClasses}>Email</label>
                                            <input type="email" name="email" value={companyForm.email ?? ''} onChange={handleCompanyInputChange} className={companyInputClasses} />
                                        </div>
                                        <div>
                                            <label className={companyLabelClasses}>Web</label>
                                            <input name="website" value={companyForm.website ?? ''} onChange={handleCompanyInputChange} className={companyInputClasses} />
                                        </div>
                                    </div>
                                    <div className="grid md:grid-cols-2 gap-4">
                                        <div>
                                            <label className={companyLabelClasses}>Régimen fiscal</label>
                                            <select name="taxRegime" value={companyForm.taxRegime ?? 'GENERAL'} onChange={handleCompanyInputChange} className={companyInputClasses}>
                                                <option value="GENERAL">General</option>
                                                <option value="SIMPLIFIED">Simplificado</option>
                                                <option value="AGRICULTURE">Agricultura</option>
                                            </select>
                                        </div>
                                    </div>
                                    {companyFormError && <p className="text-sm text-red-500">{companyFormError}</p>}
                                    {companyFormSuccess && <p className="text-sm text-green-500">{companyFormSuccess}</p>}
                                    {isCompanyError && !company && (
                                        <p className="text-sm text-amber-600 dark:text-amber-400">Aún no has registrado tu empresa. Completa el formulario y guarda los datos.</p>
                                    )}
                                    <div className="flex justify-end">
                                        <button
                                            type="submit"
                                            disabled={companyMutation.isPending}
                                            className={`px-4 py-2 rounded-lg font-semibold transition-colors ${companyMutation.isPending ? 'bg-slate-300 dark:bg-slate-700 text-slate-500 cursor-not-allowed' : 'bg-orange-500 hover:bg-orange-600 text-white'}`}
                                        >
                                            {companyMutation.isPending ? 'Guardando...' : company ? 'Actualizar empresa' : 'Registrar empresa'}
                                        </button>
                                    </div>
                                </form>
                            )}
                        </div>

                        <div className="bg-white dark:bg-slate-800 p-6 rounded-xl border border-slate-200 dark:border-slate-700">
                            <h3 className="text-lg font-bold text-slate-900 dark:text-white">Gestión de Contactos</h3>
                            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Ahorra tiempo importando tus clientes directamente desde la agenda de tu dispositivo.</p>
                            <div className="mt-4">
                                {isFreeTier ? (
                                     <button onClick={handleUpgradeClick} className="w-full relative group text-sm bg-amber-500/10 text-amber-600 dark:text-amber-400 font-bold py-2.5 px-4 rounded-lg flex items-center justify-center gap-2">
                                        <UserIcon className="w-5 h-5"/> Importar (Pro)
                                        <DiamondIcon className="w-4 h-4"/>
                                    </button>
                                ) : (
                                    <button onClick={handleImportContacts} className="w-full bg-orange-500 hover:bg-orange-600 text-white font-bold py-2.5 px-4 rounded-lg flex items-center justify-center gap-2">
                                        <UserIcon className="w-5 h-5"/> Importar Contactos del Dispositivo
                                    </button>
                                )}
                                {contactImportMessage && <p className="text-center text-sm text-slate-500 dark:text-slate-400 mt-3">{contactImportMessage}</p>}
                            </div>
                        </div>
                    </div>
                );
            }
            case 'security':
                return (
                    <div className="space-y-6">
                        <div className="p-4 bg-blue-500/10 border border-blue-500/20 rounded-xl flex items-start gap-4">
                            <ShieldCheckIcon className="w-8 h-8 text-blue-500 flex-shrink-0 mt-1" />
                            <div>
                                <h3 className="font-bold text-blue-800 dark:text-blue-300">Tu seguridad es nuestra prioridad</h3>
                                <p className="text-sm text-blue-700 dark:text-blue-400 mt-1">
                                    Todos los planes, incluido el gratuito, cuentan con las mejores prácticas de ciberseguridad. Utilizamos encriptación de extremo a extremo para tus datos y cumplimos con los estándares más exigentes.
                                </p>
                            </div>
                        </div>
            
                        <div className="bg-white dark:bg-slate-800 p-6 rounded-xl border border-slate-200 dark:border-slate-700">
                            <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">Seguridad de la Cuenta</h3>
                            <div className="divide-y divide-slate-100 dark:divide-slate-700">
                                <div className="py-3 flex justify-between items-center">
                                    <div>
                                        <p className="font-medium text-slate-700 dark:text-slate-300">Contraseña</p>
                                        <p className="text-xs text-slate-500 dark:text-slate-400">Se recomienda cambiarla periódicamente.</p>
                                    </div>
                                    <button className="text-sm bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 font-semibold py-1.5 px-3 rounded-lg">Cambiar</button>
                                </div>
                                <div className="py-3 flex justify-between items-center">
                                    <div>
                                        <h4 className="font-medium text-slate-700 dark:text-slate-300">Autenticación de Dos Factores (2FA)</h4>
                                        <p className={`text-xs ${is2faEnabled ? 'text-green-500' : 'text-slate-500 dark:text-slate-400'}`}>{is2faEnabled ? 'Activada' : 'Desactivada'}</p>
                                    </div>
                                    {subscriptionTier === 'free' ? (
                                         <button onClick={handleUpgradeClick} className="relative group text-sm bg-amber-500/10 text-amber-600 dark:text-amber-400 font-semibold py-1.5 px-3 rounded-lg flex items-center gap-1.5">
                                            <DiamondIcon className="w-4 h-4"/> Activar (Pro)
                                        </button>
                                    ) : (
                                         <button onClick={() => setIs2faEnabled(!is2faEnabled)} className={`relative inline-flex items-center h-6 rounded-full w-11 transition-colors ${is2faEnabled ? 'bg-orange-500' : 'bg-slate-300 dark:bg-slate-600'}`}>
                                            <span className={`inline-block w-4 h-4 transform bg-white rounded-full transition-transform ${is2faEnabled ? 'translate-x-6' : 'translate-x-1'}`} />
                                        </button>
                                    )}
                                </div>
                            </div>
                        </div>
                        
                        <div className="bg-white dark:bg-slate-800 p-6 rounded-xl border border-slate-200 dark:border-slate-700">
                            <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-4">Historial de Sesiones</h3>
                            {subscriptionTier === 'free' ? (
                                 <div className="text-center p-6 bg-slate-50 dark:bg-slate-700/50 rounded-lg">
                                    <p className="font-semibold text-slate-700 dark:text-slate-300">Función Pro</p>
                                    <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Revisa tus sesiones activas y cierra las que no reconozcas.</p>
                                    <button onClick={handleUpgradeClick} className="mt-4 text-sm bg-amber-500/10 text-amber-600 dark:text-amber-400 font-bold py-2 px-4 rounded-lg flex items-center gap-1.5 mx-auto">
                                        <DiamondIcon className="w-4 h-4"/> Actualizar a Pro
                                    </button>
                                </div>
                            ) : (
                                <ul className="divide-y divide-slate-100 dark:divide-slate-700">
                                    {sessions.map(session => (
                                        <li key={session.id} className="py-3 flex items-center justify-between gap-3">
                                            <div className="flex items-center gap-3">
                                                <session.icon className="w-8 h-8 text-slate-500 dark:text-slate-400" />
                                                <div>
                                                    <p className="font-semibold text-slate-800 dark:text-slate-200">{session.device} {session.isCurrent && <span className="text-xs text-green-500 ml-2">(Sesión actual)</span>}</p>
                                                    <p className="text-xs text-slate-500">{session.location} &middot; {session.lastActivity}</p>
                                                </div>
                                            </div>
                                            {!session.isCurrent && (
                                                <button onClick={() => handleEndSession(session.id)} className="text-sm text-slate-500 hover:text-red-500 font-semibold">Cerrar sesión</button>
                                            )}
                                        </li>
                                    ))}
                                </ul>
                            )}
                        </div>
            
                        {subscriptionTier === 'enterprise' && (
                            <div className="bg-white dark:bg-slate-800 p-6 rounded-xl border border-slate-200 dark:border-slate-700">
                                <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-4">Registro de Auditoría</h3>
                                <div className="overflow-x-auto">
                                    <table className="w-full text-sm">
                                        <thead className="text-left text-slate-500 dark:text-slate-400">
                                            <tr className="border-b border-slate-200 dark:border-slate-700">
                                                <th className="font-semibold p-2">Acción</th>
                                                <th className="font-semibold p-2">Fecha y Hora</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                        {mockAuditLog.map(log => (
                                            <tr key={log.id} className="border-b border-slate-100 dark:border-slate-700">
                                                <td className="p-2 text-slate-700 dark:text-slate-300">{log.action}</td>
                                                <td className="p-2 text-slate-500 dark:text-slate-400 font-mono text-xs">{log.timestamp}</td>
                                            </tr>
                                        ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        )}
            
                        <div className="bg-white dark:bg-slate-800 p-6 rounded-xl border border-slate-200 dark:border-slate-700">
                             <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-4">Cerrar Sesión</h3>
                             <button onClick={onLogout} className="w-full bg-red-500/10 hover:bg-red-500/20 text-red-500 font-semibold py-2 px-4 rounded-lg">Cerrar sesión en todos los dispositivos</button>
                        </div>
                    </div>
                );
             case 'payment':
                const inputClasses = "w-full bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg px-3 py-2 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-orange-500";
                const labelClasses = "block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1";
                return (
                    <div className="space-y-6">
                        <div className="bg-white dark:bg-slate-800 p-6 rounded-xl border border-slate-200 dark:border-slate-700">
                             <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-4">Métodos de Pago</h3>
                             <div className="space-y-3">
                                {cards.map(card => (
                                    <div key={card.id} className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-700/50 rounded-lg">
                                        <div className="flex items-center gap-3">
                                            <CreditCardIcon className="w-6 h-6 text-slate-500" />
                                            <div>
                                                <p className="font-semibold text-slate-800 dark:text-slate-200">
                                                    {card.cardType.charAt(0).toUpperCase() + card.cardType.slice(1)} terminada en {card.last4}
                                                    {card.isDefault && <span className="text-xs text-green-500 ml-2">(Predeterminada)</span>}
                                                </p>
                                                <p className="text-xs text-slate-500">Caduca: {card.expiryDate}</p>
                                            </div>
                                        </div>
                                        <button className="text-slate-400 hover:text-red-500 p-1"><TrashIcon className="w-5 h-5" /></button>
                                    </div>
                                ))}
                             </div>
                             {!showAddCardForm && (
                                <button onClick={() => { setShowAddCardForm(true); playSound('click'); }} className="w-full mt-4 bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 font-semibold py-2 px-4 rounded-lg flex items-center justify-center gap-2">
                                    <PlusIcon className="w-5 h-5"/> Añadir nueva tarjeta
                                </button>
                             )}
                        </div>

                        {showAddCardForm && (
                            <div className="bg-white dark:bg-slate-800 p-6 rounded-xl border border-slate-200 dark:border-slate-700">
                                <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-4">Añadir Nueva Tarjeta</h3>
                                <form onSubmit={handleAddCard} className="space-y-4">
                                     <div>
                                        <label htmlFor="cardholderName" className={labelClasses}>Nombre del Titular</label>
                                        <input type="text" id="cardholderName" name="cardholderName" value={newCard.cardholderName} onChange={handleCardChange} className={`${inputClasses} ${cardErrors.cardholderName ? 'border-red-500' : ''}`} placeholder="Ej: Mi Empresa Creativa S.L." />
                                        {cardErrors.cardholderName && <p className="text-red-500 text-xs mt-1">{cardErrors.cardholderName}</p>}
                                    </div>
                                    <div>
                                        <label htmlFor="cardNumber" className={labelClasses}>Número de Tarjeta</label>
                                        <input type="text" id="cardNumber" name="cardNumber" value={newCard.cardNumber} onChange={handleCardChange} className={`${inputClasses} ${cardErrors.cardNumber ? 'border-red-500' : ''}`} placeholder="0000 0000 0000 0000" inputMode="numeric" />
                                        {cardErrors.cardNumber && <p className="text-red-500 text-xs mt-1">{cardErrors.cardNumber}</p>}
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label htmlFor="expiryDate" className={labelClasses}>Fecha de Caducidad</label>
                                            <input type="text" id="expiryDate" name="expiryDate" value={newCard.expiryDate} onChange={handleCardChange} className={`${inputClasses} ${cardErrors.expiryDate ? 'border-red-500' : ''}`} placeholder="MM / AA" />
                                            {cardErrors.expiryDate && <p className="text-red-500 text-xs mt-1">{cardErrors.expiryDate}</p>}
                                        </div>
                                         <div>
                                            <label htmlFor="cvv" className={labelClasses}>CVV</label>
                                            <input type="text" id="cvv" name="cvv" value={newCard.cvv} onChange={handleCardChange} className={`${inputClasses} ${cardErrors.cvv ? 'border-red-500' : ''}`} placeholder="123" inputMode="numeric" />
                                            {cardErrors.cvv && <p className="text-red-500 text-xs mt-1">{cardErrors.cvv}</p>}
                                        </div>
                                    </div>
                                    <div className="flex gap-4 pt-2">
                                        <button type="button" onClick={() => { setShowAddCardForm(false); playSound('close'); }} className="w-full bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 font-semibold py-2 px-4 rounded-lg">Cancelar</button>
                                        <button type="submit" disabled={!isCardFormValid} className="w-full bg-orange-500 hover:bg-orange-600 text-white font-bold py-2 px-4 rounded-lg disabled:bg-slate-400 dark:disabled:bg-slate-600">Guardar Tarjeta</button>
                                    </div>
                                </form>
                            </div>
                        )}
                    </div>
                );
            case 'subscription':
                return (
                     <div className="space-y-6">
                        <div className="bg-white dark:bg-slate-800 p-6 rounded-xl border border-slate-200 dark:border-slate-700">
                             <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-4">Suscripción y Facturación</h3>
                             <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-700/50 rounded-lg">
                                <div className="flex items-center gap-3">
                                    <DiamondIcon className="w-5 h-5 text-slate-500 dark:text-slate-400" />
                                    <span className="font-medium text-slate-700 dark:text-slate-300">Plan Actual</span>
                                </div>
                                <span className="font-semibold text-slate-800 dark:text-white capitalize">{subscriptionTier}</span>
                            </div>
                            {subscriptionTier === 'free' ? (
                                <button onClick={handleUpgradeClick} className="w-full mt-4 bg-gradient-to-r from-amber-500 to-rose-600 text-white font-bold py-3 px-4 rounded-lg flex items-center justify-center gap-2 shadow-lg hover:scale-105 transition-transform"><DiamondIcon className="w-5 h-5" />Actualizar a Pro</button>
                            ) : (
                                <div className="flex flex-col sm:flex-row gap-4 mt-4">
                                     <button className="w-full bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 font-semibold py-2 px-4 rounded-lg">Ver Historial de Facturas</button>
                                    <button onClick={handleOpenCancelModal} className="w-full bg-red-500/10 hover:bg-red-500/20 text-red-500 font-semibold py-2 px-4 rounded-lg">Cancelar Suscripción</button>
                                </div>
                            )}
                        </div>
                     </div>
                );
        }
    }

    const navItems: { id: SettingsSection, label: string, icon: React.ElementType }[] = [
        { id: 'profile', label: 'Perfil', icon: UserCircleIcon },
        { id: 'security', label: 'Seguridad', icon: ShieldCheckIcon },
        { id: 'payment', label: 'Métodos de Pago', icon: CreditCardIcon },
        { id: 'subscription', label: 'Suscripción', icon: DiamondIcon },
    ];

    return (
        <>
            <div className="p-4 md:p-6 space-y-6">
                <div>
                    <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Ajustes</h2>
                    <p className="text-slate-500 dark:text-slate-400">Gestiona tu cuenta, seguridad y preferencias.</p>
                </div>
                
                <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 items-start">
                    <div className="lg:col-span-1 bg-white dark:bg-slate-800 p-4 rounded-xl border border-slate-200 dark:border-slate-700">
                        <nav className="space-y-1">
                            {navItems.map(item => (
                                <button
                                    key={item.id}
                                    onClick={() => setActiveSection(item.id)}
                                    className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-left transition-colors ${activeSection === item.id ? 'bg-orange-500/10 text-orange-600 dark:text-orange-400' : 'hover:bg-slate-100 dark:hover:bg-slate-700/50'}`}
                                >
                                    <item.icon className="w-5 h-5" />
                                    <span className="font-semibold">{item.label}</span>
                                </button>
                            ))}
                        </nav>
                    </div>
                    <div className="lg:col-span-3">
                       {renderSection()}
                    </div>
                </div>
            </div>
            <CancelSubscriptionModal isOpen={isCancelModalOpen} onClose={() => setIsCancelModalOpen(false)} onConfirm={handleConfirmCancel} />
            <CameraModal isOpen={isCameraModalOpen} onClose={() => setIsCameraModalOpen(false)} onCapture={handlePhotoCapture}/>
        </>
    );
};

export default Settings;