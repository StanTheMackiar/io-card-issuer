let currentCloudEventId = 0;

export function nextCloudEventId(): string {
  currentCloudEventId += 1;

  return currentCloudEventId.toString();
}
