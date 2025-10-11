import prisma from '@/lib/prisma';
import RegisterAdmin from './form-register-admin';
import { Metadata } from 'next';

export const generateMetadata = async (): Promise<Metadata> => {
  return {
    title: 'Cadastrar Administrador'
  };
};
export default async function Register() {
  const isAdmin = await prisma.user.findMany({
    where: {
      role: 'ADMIN'
    }
  });
  const Title = isAdmin ? 'Cadastrar Usuário' : 'Cadastrar Administrador';

  return <RegisterAdmin TitleIntl={Title} />;
}