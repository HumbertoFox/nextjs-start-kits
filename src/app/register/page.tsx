import RegisterAdmin from './form-register-admin';
import { Metadata } from 'next';
import { getIsAdmin } from '@/lib/getisadmin';

export const generateMetadata = async (): Promise<Metadata> => {
  const isAdmin = await getIsAdmin();
  return {
    title: isAdmin ? 'Cadastrar Usuário' : 'Cadastrar Administrador'
  };
};

export default async function Register() {
  const isAdmin = await getIsAdmin();
  const Title = isAdmin ? 'Cadastrar Usuário' : 'Cadastrar Administrador';
  return <RegisterAdmin TitleIntl={Title} />;
}