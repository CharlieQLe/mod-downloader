import Soup from 'gi://Soup?version=3.0';
import GLib from 'gi://GLib';
import Gio from 'gi://Gio';

const BASE_URL = 'https://api.nexusmods.com/v1';

type Period = '1d' | '1w' | '1m';

type ModSort = 'latest_added' | 'latest_updated' | 'trending';

type FileCategory = 'main' | 'update' | 'optional' | 'old_version' | 'miscellaneous';

export interface NexusChangelogs {
    [key: string]: string[],
}

export interface NexusCategory {
    category_id: number,
    name: string,
    parent_category: boolean | number,
}

export interface NexusGame {
    id: number,
    name: string,
    forum_url: string,
    nexusmods_url: string,
    genre: string,
    file_count: number,
    downloads: number,
    domain_name: string,
    approved_date: number,
    file_views: number,
    authors: number,
    file_endorsements: number,
    mods: number,
    categories: NexusCategory[],
}

export interface NexusUser {
    member_id: number,
    member_group_id: number,
    name: string,
}

export interface NexusMod {
    name: string,
    summary: string,
    description: string,
    picture_url: string,
    mod_downloads: number,
    mod_unique_downloads: number,
    uid: number,
    mod_id: number,
    game_id: number,
    allow_rating: boolean,
    domain_name: string,
    category_id: number,
    version: string,
    endorsement_count: number,
    created_timestamp: number,
    created_time: string,
    updated_timestamp: number,
    updated_time: string,
    author: string,
    uploaded_by: string,
    uploaded_users_profile_url: string,
    contains_adult_content: boolean,
    status: string,
    available: boolean,
    user: NexusUser,
    endorsement: object,
}

export interface NexusUpdatedMod {
    mod_id: number,
    latest_file_update: number,
    latest_mod_activity: number,
}

export interface NexusValidate {
    user_id: number,
    key: string,
    name: string,
    'is_premium?': boolean,
    'is_supporter?': boolean,
    email: string,
    profile_url: string,
    is_supporter: boolean,
    is_premium: false,
}

export interface NexusRateLimit {
    limit: number,
    remaining: number,
    reset: string,
}

export interface NexusResponseHeader {
    hourly: NexusRateLimit,
    daily: NexusRateLimit,
}

export interface NexusModFile {
    id: number[],
    uid: number,
    file_id: number,
    name: string,
    version: string,
    category_id: number,
    category_name: string,
    is_primary: boolean,
    size: number,
    file_name: string,
    uploaded_timestamp: number,
    uploaded_time: number,
    mod_version: string,
    external_virus_scan_url: string,
    description: string,
    size_kb: number,
    size_in_bytes: number,
    changelog_html: string,
    content_preview_link: string
}

export interface NexusModFiles {
    files: NexusModFile[],
    file_updates: any[],
}

export interface NexusDownloadLink {
    name: string;
    short_name: string;
    URI: string;
}

export class NexusSession {
    private _apiKey: string;
    private _session: Soup.Session;

    public constructor(apiKey: string) {
        this._apiKey = apiKey;
        this._session = Soup.Session.new();
    }

    private _appendApiKey(header: Soup.MessageHeaders) {
        header.append('apiKey', this._apiKey);
    }

    private _getResponseHeader(header: Soup.MessageHeaders): NexusResponseHeader {
        return {
            hourly: {
                limit: parseInt(header.get_one('X-RL-Hourly-Limit') as string),
                remaining: parseInt(header.get_one('X-RL-Hourly-Remaining') as string),
                reset: header.get_one('X-RL-Hourly-Reset') as string,
            },
            daily: {
                limit: parseInt(header.get_one('X-RL-Daily-Limit') as string),
                remaining: parseInt(header.get_one('X-RL-Daily-Remaining') as string),
                reset: header.get_one('X-RL-Daily-Reset') as string,
            },
        };
    }

    private _buildGetRequest(route: string[], query?: { [key: string]: string }) {
        let path = GLib.build_pathv('/', [BASE_URL, ...route]);
        if (query) {
            Object.entries(query).forEach(([key, value], index) => {
                path = `${path}${index === 0 ? '?' : '&'}${key}=${value}`;
            });
        }
        const msg = Soup.Message.new("GET", path);
        this._appendApiKey(msg.get_request_headers())
        return msg;
    }

    // MODS

    public async getUpdatedModsAsync(period: Period, gameDomainName: string): Promise<[NexusResponseHeader, NexusUpdatedMod[]]> {
        const msg = this._buildGetRequest([`games`, gameDomainName, 'mods', 'updated.json'], { 'period': period });
        const bytes = await this._session.send_and_read_async(msg, GLib.PRIORITY_DEFAULT, null)
        const responseHeader: NexusResponseHeader = this._getResponseHeader(msg.get_response_headers());
        const str = new TextDecoder().decode(bytes.toArray());
        const data: NexusUpdatedMod[] = JSON.parse(str);
        return [responseHeader, data];
    }

    public async getModChangelogsAsync(modId: number, gameDomainName: string): Promise<[NexusResponseHeader, NexusChangelogs]> {
        const msg = this._buildGetRequest([`games`, gameDomainName, 'mods', modId.toString(), 'changelogs.json']);
        const bytes = await this._session.send_and_read_async(msg, GLib.PRIORITY_DEFAULT, null)
        const responseHeader: NexusResponseHeader = this._getResponseHeader(msg.get_response_headers());
        const str = new TextDecoder().decode(bytes.toArray());
        const data: NexusChangelogs = JSON.parse(str);
        return [responseHeader, data];
    }

    public async getModsAsync(sort: ModSort, gameDomainName: string): Promise<[NexusResponseHeader, NexusMod[]]> {
        const msg = this._buildGetRequest(['games', gameDomainName, 'mods', `${sort}.json`]);
        const bytes = await this._session.send_and_read_async(msg, GLib.PRIORITY_DEFAULT, null)
        const responseHeader: NexusResponseHeader = this._getResponseHeader(msg.get_response_headers());
        const str = new TextDecoder().decode(bytes.toArray());
        const data: NexusMod[] = JSON.parse(str);
        return [responseHeader, data];
    }

    public async getModAsync(id: number, gameDomainName: string): Promise<[NexusResponseHeader, NexusMod]> {
        const msg = this._buildGetRequest(['games', gameDomainName, 'mods', `${id}.json`]);
        const bytes = await this._session.send_and_read_async(msg, GLib.PRIORITY_DEFAULT, null)
        const responseHeader: NexusResponseHeader = this._getResponseHeader(msg.get_response_headers());
        const str = new TextDecoder().decode(bytes.toArray());
        const data: NexusMod = JSON.parse(str);
        return [responseHeader, data];
    }

    // MOD FILES

    public async getModFilesAsync(modId: number, gameDomainName: string, category?: FileCategory): Promise<[NexusResponseHeader, NexusModFiles]> {
        const msg = this._buildGetRequest(['games', gameDomainName, 'mods', modId.toString(), 'files.json'], category ? { 'category': category } : undefined);
        const bytes = await this._session.send_and_read_async(msg, GLib.PRIORITY_DEFAULT, null)
        const responseHeader: NexusResponseHeader = this._getResponseHeader(msg.get_response_headers());
        const str = new TextDecoder().decode(bytes.toArray());
        const data: NexusModFiles = JSON.parse(str);
        return [responseHeader, data];
    }

    public async getModFileAsync(fileId: number, modId: number, gameDomainName: string): Promise<[NexusResponseHeader, NexusModFile]> {
        const msg = this._buildGetRequest(['games', gameDomainName, 'mods', modId.toString(), 'files', `${fileId}.json`]);
        const bytes = await this._session.send_and_read_async(msg, GLib.PRIORITY_DEFAULT, null)
        const responseHeader: NexusResponseHeader = this._getResponseHeader(msg.get_response_headers());
        const str = new TextDecoder().decode(bytes.toArray());
        const data: NexusModFile = JSON.parse(str);
        return [responseHeader, data];
    }

    public async getDownloadLinkAsync(fileId: number, modId: number, gameDomainName: string, key?: string, expires?: number): Promise<[NexusResponseHeader, NexusDownloadLink[]]> {
        const msg = this._buildGetRequest(['games', gameDomainName, 'mods', modId.toString(), 'files', fileId.toString(), 'download_link.json'],
            (key && expires) ? { 'key': key, 'expires': expires.toString() } : undefined);
        const bytes = await this._session.send_and_read_async(msg, GLib.PRIORITY_DEFAULT, null)
        const responseHeader: NexusResponseHeader = this._getResponseHeader(msg.get_response_headers());
        const str = new TextDecoder().decode(bytes.toArray());
        const data: NexusDownloadLink[] = JSON.parse(str);
        return [responseHeader, data];
    }

    // GAMES

    public async getGamesAsync(includeUnapproved?: boolean): Promise<[NexusResponseHeader, NexusGame[]]> {
        const msg = this._buildGetRequest(['games.json'], includeUnapproved === undefined ? undefined : { 'include_unapproved': includeUnapproved.toString() });
        const bytes = await this._session.send_and_read_async(msg, GLib.PRIORITY_DEFAULT, null)
        const responseHeader: NexusResponseHeader = this._getResponseHeader(msg.get_response_headers());
        const str = new TextDecoder().decode(bytes.toArray());
        const data: NexusGame[] = JSON.parse(str);
        return [responseHeader, data];
    }

    public async getGameAsync(gameDomainName: string): Promise<[NexusResponseHeader, NexusGame]> {
        const msg = this._buildGetRequest(['games', `${gameDomainName}.json`]);
        const bytes = await this._session.send_and_read_async(msg, GLib.PRIORITY_DEFAULT, null)
        const responseHeader: NexusResponseHeader = this._getResponseHeader(msg.get_response_headers());
        const str = new TextDecoder().decode(bytes.toArray());
        const data = JSON.parse(str);
        return [responseHeader, data as NexusGame];
    }

    // USER

    public async getValidateAsync(): Promise<[NexusResponseHeader, NexusValidate]> {
        const msg = this._buildGetRequest(['users', 'validate.json']);
        const bytes = await this._session.send_and_read_async(msg, GLib.PRIORITY_DEFAULT, null)
        const responseHeader: NexusResponseHeader = this._getResponseHeader(msg.get_response_headers());
        const str = new TextDecoder().decode(bytes.toArray());
        const data: NexusValidate = JSON.parse(str, (key: string, value: any) => key === 'profile_url' ? '' : value);
        return [responseHeader, data];
    }

    public async getTrackedModsAsync(): Promise<[NexusResponseHeader, any[]]> {
        const msg = this._buildGetRequest(['user', 'tracked_mods.json']);
        const bytes = await this._session.send_and_read_async(msg, GLib.PRIORITY_DEFAULT, null)
        const responseHeader: NexusResponseHeader = this._getResponseHeader(msg.get_response_headers());
        const str = new TextDecoder().decode(bytes.toArray());
        return [responseHeader, JSON.parse(str) as []];
    }

    public async getEndorsementsAsync(): Promise<[NexusResponseHeader, any[]]> {
        const msg = this._buildGetRequest(['user', 'endorsements.json']);
        const bytes = await this._session.send_and_read_async(msg, GLib.PRIORITY_DEFAULT, null)
        const responseHeader: NexusResponseHeader = this._getResponseHeader(msg.get_response_headers());
        const str = new TextDecoder().decode(bytes.toArray());
        return [responseHeader, JSON.parse(str) as []];
    }

    // DOWNLOADS

    public async downloadFileAsync(link: string, filename: string) {
        const msg = Soup.Message.new("GET", link);
        const bytes = await this._session.send_and_read_async(msg, GLib.PRIORITY_DEFAULT, null);
        log('finished sending and reading');
        const file = Gio.File.new_for_path(`${GLib.get_home_dir()}/${filename}`); // TODO: Use proper location
        if (file.query_exists(null)) await file.delete_async(GLib.PRIORITY_DEFAULT, null);
        const stream = await file.create_async(Gio.FileCreateFlags.NONE, GLib.PRIORITY_DEFAULT, null);
        await stream.write_bytes_async(bytes.toArray(), GLib.PRIORITY_DEFAULT, null);
        await stream.close_async(GLib.PRIORITY_DEFAULT, null);
    }
}

export interface NexusUriComponents {
    gameDomainName: string,
    modId: number,
    fileId: number,
    key: string,
    expires: number,
}

export function handleNxmUri(uri: string): NexusUriComponents {
    if (!uri.startsWith('nxm://')) {
        throw new Error(`URI '${uri}' is not valid!`)
    }
    const data = uri.substring(6).split('/');
    const fileDataSplit = data[4].split('?');

    let key = '';
    let expires = -1;
    fileDataSplit[1].split('&').forEach(q => {
        const split = q.split('=');
        if (q.startsWith('key=')) key = split[1];
        else if (q.startsWith('expires=')) expires = parseInt(split[1]);
    })
    return {
        gameDomainName: data[0],
        modId: parseInt(data[2]),
        fileId: parseInt(fileDataSplit[0]),
        key: key,
        expires: expires
    };
}