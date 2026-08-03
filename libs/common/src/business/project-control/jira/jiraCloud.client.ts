import axios, { AxiosInstance } from 'axios';

export type JiraCloudCredentials = {
  baseUrl: string;
  email: string;
  apiToken: string;
};

export type JiraIssue = {
  id: string;
  key: string;
  fields: {
    summary?: string;
    description?: unknown;
    issuetype?: { name?: string; subtask?: boolean };
    status?: { name?: string };
    priority?: { name?: string };
    assignee?: { emailAddress?: string; displayName?: string } | null;
    parent?: { key?: string; id?: string } | null;
    timetracking?: {
      originalEstimateSeconds?: number;
      remainingEstimateSeconds?: number;
    };
    [key: string]: unknown;
  };
};

export type JiraWorklog = {
  id: string;
  timeSpentSeconds: number;
  started: string;
  comment?: unknown;
  author?: { emailAddress?: string; displayName?: string };
};

export class JiraCloudClient {
  private readonly http: AxiosInstance;

  constructor(private readonly credentials: JiraCloudCredentials) {
    const baseURL = credentials.baseUrl.replace(/\/+$/, '');
    const auth = Buffer.from(
      `${credentials.email}:${credentials.apiToken}`,
    ).toString('base64');
    this.http = axios.create({
      baseURL,
      headers: {
        Authorization: `Basic ${auth}`,
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
      timeout: 60000,
    });
  }

  async testConnection(): Promise<{ accountId: string; displayName: string }> {
    const { data } = await this.http.get('/rest/api/3/myself');
    return {
      accountId: data.accountId,
      displayName: data.displayName,
    };
  }

  async searchProjectIssues(
    projectKey: string,
    fields: string[] = [
      'summary',
      'description',
      'issuetype',
      'status',
      'priority',
      'assignee',
      'parent',
      'timetracking',
      'customfield_10016',
      'customfield_10020',
      'customfield_10021',
    ],
  ): Promise<JiraIssue[]> {
    const issues: JiraIssue[] = [];
    const maxResults = 100;
    const jql = `project = "${projectKey.replace(/"/g, '\\"')}" ORDER BY key ASC`;
    let nextPageToken: string | undefined;

    for (;;) {
      const body: Record<string, unknown> = {
        jql,
        maxResults,
        fields,
      };
      if (nextPageToken) {
        body.nextPageToken = nextPageToken;
      }

      const { data } = await this.http.post('/rest/api/3/search/jql', body);
      const batch = (data.issues ?? []) as JiraIssue[];
      issues.push(...batch);

      if (data.isLast === true || !data.nextPageToken || batch.length === 0) {
        break;
      }
      nextPageToken = data.nextPageToken as string;
    }

    return issues;
  }

  async getIssueWorklogs(issueKeyOrId: string): Promise<JiraWorklog[]> {
    const worklogs: JiraWorklog[] = [];
    let startAt = 0;
    const maxResults = 100;

    for (;;) {
      const { data } = await this.http.get(
        `/rest/api/3/issue/${encodeURIComponent(issueKeyOrId)}/worklog`,
        { params: { startAt, maxResults } },
      );
      const batch = (data.worklogs ?? []) as JiraWorklog[];
      worklogs.push(...batch);
      const total = Number(data.total ?? worklogs.length);
      startAt += batch.length;
      if (batch.length === 0 || startAt >= total) break;
    }

    return worklogs;
  }
}
