import type { PermissionResolvable } from "@fluxerjs/core";
import type { Message } from "@fluxerjs/core";
import { PermissionsBitField } from "@fluxerjs/core";

function memberHasPermissions(
  permissions: PermissionsBitField | null | undefined,
  required: PermissionResolvable[],
): boolean {
  if (required.length === 0) {
    return true;
  }
  if (!permissions) {
    return false;
  }
  return permissions.has(required as PermissionResolvable);
}

export async function checkCommandPermissions(
  message: Message,
  userPermissions: PermissionResolvable[] | undefined,
  botPermissions: PermissionResolvable[] | undefined,
): Promise<boolean> {
  const guild = message.guild;
  if (!guild) {
    if (userPermissions?.length || botPermissions?.length) {
      return false;
    }
    return true;
  }
  if (userPermissions?.length) {
    const member = await guild.members.resolve(message.author.id);
    if (!memberHasPermissions(member.permissions, userPermissions)) {
      return false;
    }
  }
  if (botPermissions?.length) {
    const me = guild.members.me ?? (await guild.members.fetchMe().catch(() => null));
    if (!memberHasPermissions(me?.permissions, botPermissions)) {
      return false;
    }
  }
  return true;
}
