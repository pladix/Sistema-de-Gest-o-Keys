import { create } from 'zustand';

type Language = 'pt-BR' | 'en-US';

interface I18nStore {
  language: Language;
  setLanguage: (lang: Language) => void;
  translations: {
    [key in Language]: {
      [key: string]: string;
    };
  };
}

export const useI18n = create<I18nStore>((set) => ({
  language: (localStorage.getItem('language') as Language) || 'pt-BR',
  setLanguage: (lang) => {
    localStorage.setItem('language', lang);
    set({ language: lang });
  },
  translations: {
    'pt-BR': {
      login: 'Entrar',
      register: 'Cadastrar',
      username: 'Usuário',
      password: 'Senha',
      telegramId: 'ID do Telegram',
      pin: 'PIN (6 dígitos)',
      apiKey: 'Chave API',
      rememberMe: 'Lembrar minha chave',
      logout: 'Sair',
      resetApiKey: 'Redefinir Chave API',
      changePassword: 'Alterar Senha',
      changePin: 'Alterar PIN',
      deleteAccount: 'Excluir Conta',
      copyApiKey: 'Copiar Chave API',
      registrationSuccess: 'Cadastro realizado com sucesso!',
      language: 'Idioma',
      userInfo: 'Informações do Usuário',
      security: 'Segurança',
      apiManagement: 'Gerenciamento de API',
      account: 'Conta',
      recentActivity: 'Atividade Recente',
      credits: 'Créditos',
      administrator: 'Administrador',
      manageUsers: 'Gerenciar Usuários',
      createUser: 'Criar Usuário',
      addCredits: 'Adicionar Créditos',
      removeCredits: 'Remover Créditos',
      confirmDelete: 'Confirmar Exclusão',
      deleteConfirmation: 'Tem certeza que deseja excluir sua conta? Esta ação não pode ser desfeita.',
      enterPinConfirm: 'Digite seu PIN para confirmar',
      invalidCredentials: 'Credenciais inválidas',
      usernameTaken: 'Nome de usuário já está em uso',
      telegramIdTaken: 'ID do Telegram já está em uso',
      registrationFailed: 'Falha no cadastro. Tente novamente.',
      apiKeyResetSuccess: 'Chave API redefinida com sucesso',
      apiKeyResetWait: 'Você poderá redefinir sua chave API em {days} dias',
      passwordChanged: 'Senha alterada com sucesso',
      pinChanged: 'PIN alterado com sucesso',
      accountDeleted: 'Conta excluída com sucesso',
      creditsAdded: 'Créditos adicionados com sucesso',
      creditsRemoved: 'Créditos removidos com sucesso',
      insufficientCredits: 'Créditos insuficientes',
      userNotFound: 'Usuário não encontrado',
      userBanned: 'Usuário banido com sucesso',
      userUnbanned: 'Usuário desbanido com sucesso',
      userDeleted: 'Usuário excluído com sucesso',
      searchUsers: 'Pesquisar usuários...',
      status: 'Status',
      active: 'Ativo',
      banned: 'Banido',
      actions: 'Ações',
      edit: 'Editar',
      ban: 'Banir',
      unban: 'Desbanir',
      delete: 'Excluir',
      cancel: 'Cancelar',
      save: 'Salvar',
      loading: 'Carregando...',
      processing: 'Processando...',
      welcomeBack: 'Bem-vindo(a) de volta!',
      loginSuccess: 'Login realizado com sucesso!',
      logoutSuccess: 'Logout realizado com sucesso!',
      sessionEnded: 'Sessão encerrada',
      tooManyAttempts: 'Muitas tentativas. Tente novamente mais tarde.',
      accountBanned: 'Sua conta está banida. Entre em contato com o suporte.',
      noAccount: 'Não tem uma conta?',
      forgotApiKey: 'Esqueceu sua Chave API?',
      currentPassword: 'Senha Atual',
      newPassword: 'Nova Senha',
      confirmPassword: 'Confirmar Senha',
      currentPin: 'PIN Atual',
      newPin: 'Novo PIN',
      confirmPin: 'Confirmar PIN',
      passwordsDoNotMatch: 'As senhas não coincidem',
      pinsDoNotMatch: 'Os PINs não coincidem',
      currentPasswordIncorrect: 'Senha atual incorreta',
      currentPinIncorrect: 'PIN atual incorreto',
      invalidPin: 'PIN inválido',
      passwordChangeFailed: 'Falha ao alterar senha',
      pinChangeFailed: 'Falha ao alterar PIN',
      deleteFailed: 'Falha ao excluir conta',
      noRecentActivity: 'Nenhuma atividade recente',
    },
    'en-US': {
      login: 'Login',
      register: 'Register',
      username: 'Username',
      password: 'Password',
      telegramId: 'Telegram ID',
      pin: 'PIN (6 digits)',
      apiKey: 'API Key',
      rememberMe: 'Remember my key',
      logout: 'Logout',
      resetApiKey: 'Reset API Key',
      changePassword: 'Change Password',
      changePin: 'Change PIN',
      deleteAccount: 'Delete Account',
      copyApiKey: 'Copy API Key',
      registrationSuccess: 'Registration successful!',
      language: 'Language',
      userInfo: 'User Information',
      security: 'Security',
      apiManagement: 'API Management',
      account: 'Account',
      recentActivity: 'Recent Activity',
      credits: 'Credits',
      administrator: 'Administrator',
      manageUsers: 'Manage Users',
      createUser: 'Create User',
      addCredits: 'Add Credits',
      removeCredits: 'Remove Credits',
      confirmDelete: 'Confirm Deletion',
      deleteConfirmation: 'Are you sure you want to delete your account? This action cannot be undone.',
      enterPinConfirm: 'Enter your PIN to confirm',
      invalidCredentials: 'Invalid credentials',
      usernameTaken: 'Username is already taken',
      telegramIdTaken: 'Telegram ID is already taken',
      registrationFailed: 'Registration failed. Please try again.',
      apiKeyResetSuccess: 'API Key reset successfully',
      apiKeyResetWait: 'You can reset your API Key in {days} days',
      passwordChanged: 'Password changed successfully',
      pinChanged: 'PIN changed successfully',
      accountDeleted: 'Account deleted successfully',
      creditsAdded: 'Credits added successfully',
      creditsRemoved: 'Credits removed successfully',
      insufficientCredits: 'Insufficient credits',
      userNotFound: 'User not found',
      userBanned: 'User banned successfully',
      userUnbanned: 'User unbanned successfully',
      userDeleted: 'User deleted successfully',
      searchUsers: 'Search users...',
      status: 'Status',
      active: 'Active',
      banned: 'Banned',
      actions: 'Actions',
      edit: 'Edit',
      ban: 'Ban',
      unban: 'Unban',
      delete: 'Delete',
      cancel: 'Cancel',
      save: 'Save',
      loading: 'Loading...',
      processing: 'Processing...',
      welcomeBack: 'Welcome back!',
      loginSuccess: 'Login successful!',
      logoutSuccess: 'Logout successful!',
      sessionEnded: 'Session ended',
      tooManyAttempts: 'Too many attempts. Please try again later.',
      accountBanned: 'Your account is banned. Please contact support.',
      noAccount: "Don't have an account?",
      forgotApiKey: 'Forgot your API Key?',
      currentPassword: 'Current Password',
      newPassword: 'New Password',
      confirmPassword: 'Confirm Password',
      currentPin: 'Current PIN',
      newPin: 'New PIN',
      confirmPin: 'Confirm PIN',
      passwordsDoNotMatch: 'Passwords do not match',
      pinsDoNotMatch: 'PINs do not match',
      currentPasswordIncorrect: 'Current password is incorrect',
      currentPinIncorrect: 'Current PIN is incorrect',
      invalidPin: 'Invalid PIN',
      passwordChangeFailed: 'Failed to change password',
      pinChangeFailed: 'Failed to change PIN',
      deleteFailed: 'Failed to delete account',
      noRecentActivity: 'No recent activity',
    },
  },
}));