import React, { useEffect, useMemo, useState } from 'react';
import { useAuth } from '../components/SupabaseAuthProvider';
import { supabase } from '../supabase';

type TeamMember = {
  user_id: string;
  display_name: string | null;
  email: string | null;
  role: 'owner' | 'admin' | 'member';
  areas: string[];
  joined_at: string;
};

type Invitation = {
  invitation_id: string;
  email: string;
  role: 'admin' | 'member';
  status: 'pending' | 'accepted' | 'revoked';
  expires_at: string;
};

type TeamMetrics = {
  member_count: number;
  active_members: number;
  pending_invitations: number;
  completed_events: number;
  completed_actions: number;
};

const TeamPage: React.FC = () => {
  const { user } = useAuth();
  const companyId = user?.user_metadata?.defaultCompanyId || user?.user_metadata?.default_company_id;
  const [members, setMembers] = useState<TeamMember[]>([]);
  const [invitations, setInvitations] = useState<Invitation[]>([]);
  const [metrics, setMetrics] = useState<TeamMetrics | null>(null);
  const [email, setEmail] = useState('');
  const [role, setRole] = useState<'admin' | 'member'>('member');
  const [inviteLink, setInviteLink] = useState<string | null>(null);
  const [status, setStatus] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const currentMember = useMemo(() => members.find(member => member.user_id === user?.id), [members, user?.id]);
  const canInvite = currentMember?.role === 'owner' || currentMember?.role === 'admin';

  const loadMembers = async () => {
    if (!companyId) {
      setLoading(false);
      return;
    }
    const { data, error: membersError } = await supabase.rpc('list_company_members', { p_company_id: companyId });
    if (membersError) {
      setError('No pudimos cargar el equipo. Verifica que la migración de invitaciones esté aplicada.');
    } else {
      setMembers((data || []) as TeamMember[]);
      const [{ data: invitationData }, { data: metricData }] = await Promise.all([
        supabase.rpc('list_company_invitations', { p_company_id: companyId }),
        supabase.rpc('get_company_team_metrics', { p_company_id: companyId })
      ]);
      setInvitations((invitationData || []) as Invitation[]);
      setMetrics((metricData?.[0] || null) as TeamMetrics | null);
    }
    setLoading(false);
  };

  const manageMember = async (member: TeamMember, action: 'remove' | 'admin' | 'member') => {
    if (!companyId) return;
    setError(null);
    const result = action === 'remove'
      ? await supabase.rpc('remove_company_member', { p_company_id: companyId, p_user_id: member.user_id })
      : await supabase.rpc('update_company_member_role', { p_company_id: companyId, p_user_id: member.user_id, p_role: action });
    if (result.error) {
      setError(result.error.message);
      return;
    }
    setStatus(action === 'remove' ? 'Miembro retirado.' : 'Rol actualizado.');
    await loadMembers();
  };

  const revokeInvitation = async (invitationId: string) => {
    const { error: revokeError } = await supabase.rpc('revoke_company_invitation', { p_invitation_id: invitationId });
    if (revokeError) {
      setError(revokeError.message);
      return;
    }
    setStatus('Invitación revocada.');
    await loadMembers();
  };

  useEffect(() => {
    void loadMembers();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [companyId]);

  const createInvitation = async (event: React.FormEvent) => {
    event.preventDefault();
    setError(null);
    setStatus(null);
    setInviteLink(null);
    if (!companyId || !email.trim()) return;
    const { data, error: invitationError } = await supabase.rpc('create_company_invitation', {
      p_company_id: companyId,
      p_email: email.trim().toLowerCase(),
      p_role: role,
      p_areas: []
    });
    if (invitationError) {
      setError(invitationError.message);
      return;
    }
    const token = data?.[0]?.invitation_token;
    if (!token) {
      setError('No se generó un enlace de invitación.');
      return;
    }
    const link = `${window.location.origin}/auth?invite=${token}&next=%2Fdashboard`;
    setInviteLink(link);
    setStatus('Invitación creada. Comparte este enlace con la persona y dile que use el mismo correo.');
    setEmail('');
  };

  const copyInvite = async () => {
    if (!inviteLink) return;
    await navigator.clipboard.writeText(inviteLink);
    setStatus('Enlace copiado.');
  };

  return (
    <main className="min-h-screen bg-dark-bg text-white p-4 md:p-8">
      <div className="mx-auto max-w-4xl">
        <h1 className="text-3xl font-bold">Equipo y accesos</h1>
        <p className="mt-2 text-gray-300">Cada persona tiene su cuenta y progreso propio. La empresa conserva la visión general.</p>

        {!companyId && <p role="alert" className="mt-6 rounded-lg bg-amber-500/10 p-4 text-amber-200">Aún no hay una empresa asociada a esta cuenta.</p>}
        {error && <p role="alert" className="mt-6 rounded-lg bg-red-500/10 p-4 text-red-200">{error}</p>}
        {status && <p role="status" className="mt-6 rounded-lg bg-emerald-500/10 p-4 text-emerald-200">{status}</p>}

        {metrics && (
          <div className="mt-6 grid grid-cols-2 gap-3 md:grid-cols-5">
            {[
              ['Personas', metrics.member_count],
              ['Activas (30d)', metrics.active_members],
              ['Invitaciones', metrics.pending_invitations],
              ['Aprendizajes', metrics.completed_events],
              ['Acciones', metrics.completed_actions]
            ].map(([label, value]) => (
              <div key={label} className="rounded-xl border border-gray-700 bg-dark-secondary p-4">
                <p className="text-2xl font-bold">{value}</p>
                <p className="text-xs text-gray-400">{label}</p>
              </div>
            ))}
          </div>
        )}

        {canInvite && (
          <form onSubmit={createInvitation} className="mt-6 rounded-xl border border-gray-700 bg-dark-secondary p-5">
            <h2 className="text-xl font-semibold">Invitar a una persona</h2>
            <p className="mt-1 text-sm text-gray-400">En V1 se genera un enlace seguro. No compartas el enlace públicamente.</p>
            <div className="mt-4 grid gap-3 md:grid-cols-[1fr_auto_auto]">
              <input aria-label="Correo del invitado" type="email" required value={email} onChange={event => setEmail(event.target.value)} placeholder="empleado@empresa.com" className="rounded-lg border border-gray-600 bg-dark-bg px-3 py-2" />
              <select aria-label="Rol" value={role} onChange={event => setRole(event.target.value as 'admin' | 'member')} className="rounded-lg border border-gray-600 bg-dark-bg px-3 py-2">
                <option value="member">Empleado</option>
                <option value="admin">Administrador</option>
              </select>
              <button className="rounded-lg bg-violet-600 px-4 py-2 font-semibold">Generar invitación</button>
            </div>
            {inviteLink && (
              <div className="mt-4 flex gap-2">
                <input aria-label="Enlace de invitación" readOnly value={inviteLink} className="min-w-0 flex-1 rounded-lg border border-gray-600 bg-dark-bg px-3 py-2 text-sm" />
                <button type="button" onClick={copyInvite} className="rounded-lg border border-gray-500 px-3 py-2">Copiar</button>
              </div>
            )}
          </form>
        )}

        <section className="mt-6 rounded-xl border border-gray-700 bg-dark-secondary p-5">
          <h2 className="text-xl font-semibold">Personas con acceso</h2>
          {loading ? <p className="mt-4 text-gray-400">Cargando equipo...</p> : members.length === 0 ? <p className="mt-4 text-gray-400">Todavía no hay miembros asociados.</p> : (
            <ul className="mt-4 divide-y divide-gray-700">
              {members.map(member => (
                <li key={member.user_id} className="flex items-center justify-between gap-4 py-3">
                  <div><p className="font-medium">{member.display_name || 'Sin nombre'}</p><p className="text-sm text-gray-400">{member.email}</p></div>
                  <div className="flex items-center gap-2">
                    <span className="rounded-full bg-gray-700 px-3 py-1 text-xs">{member.role === 'owner' ? 'Propietario' : member.role === 'admin' ? 'Administrador' : 'Empleado'}</span>
                    {member.role !== 'owner' && currentMember?.role === 'owner' && (
                      <>
                        <select aria-label={`Rol de ${member.email}`} value={member.role} onChange={event => void manageMember(member, event.target.value as 'admin' | 'member')} className="rounded border border-gray-600 bg-dark-bg px-2 py-1 text-xs">
                          <option value="member">Empleado</option>
                          <option value="admin">Administrador</option>
                        </select>
                        <button type="button" onClick={() => void manageMember(member, 'remove')} className="text-xs text-red-300 hover:text-red-200">Retirar</button>
                      </>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          )}
        </section>

        {canInvite && invitations.length > 0 && (
          <section className="mt-6 rounded-xl border border-gray-700 bg-dark-secondary p-5">
            <h2 className="text-xl font-semibold">Invitaciones</h2>
            <ul className="mt-4 divide-y divide-gray-700">
              {invitations.map(invitation => (
                <li key={invitation.invitation_id} className="flex items-center justify-between gap-4 py-3 text-sm">
                  <span>{invitation.email} · {invitation.role === 'admin' ? 'Administrador' : 'Empleado'}</span>
                  {invitation.status === 'pending' && <button type="button" onClick={() => void revokeInvitation(invitation.invitation_id)} className="text-red-300">Revocar</button>}
                </li>
              ))}
            </ul>
          </section>
        )}
      </div>
    </main>
  );
};

export default TeamPage;
