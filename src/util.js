export function getLastMonth() {
    const date = new Date();
    const month = date.getMonth();

    date.setMonth(date.getMonth() - 1);
    if (date.getMonth() == month)
        date.setDate(0);
    
    date.setHours(0, 0, 0, 0);
    return date.getTime();
};

/**
 * @param { import("discord.js").ThreadChannel } post
 */
export async function getLastMonthMembers(post) {
    /** @type { import("discord.js").User[] } */
    const members = [];
    let lastMessage;

    const lastMonth = getLastMonth();
    for (let i = 0; i < post.totalMessageSent; i++) {
        const messages = await post.messages.fetch({ before: lastMessage, limit: 100 });
        for (let j = 0; j < messages.size; j++) {
            const message = messages.at(j);
            if (message.createdTimestamp < lastMonth)
                break;

            if (members.find((user) => user.id === message.author.id))
                continue;

            members.push(message.author);
        };
        
        const message = messages.at(messages.size - 1);
        if (message === void 0)
            continue;

        if (message.createdTimestamp < lastMonth)
            break;

        lastMessage = message.id;
    };

    return members;
};

/**
 * @param { import("discord.js").ThreadChannel } post
 */
export async function getMembers(post) {
    /** @type { import("discord.js").User[] } */
    const threadMembers = [];
    let lastMember;

    for (let i = 0; i < post.memberCount; i++) {
        const members = await post.members.fetch({ withMember: true, after: lastMember });
        for (let j = 0; j < members.size; j++) {
            const member = members.at(j);
            threadMembers.push(member);
        };

        const member = members.at(members.size - 1);
        if (member === void 0)
            continue;

        lastMember = member.id;
    };

    return threadMembers;
};