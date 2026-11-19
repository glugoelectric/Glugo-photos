/**
 * GLugo Job Photos — read side (iPad / Mac viewer).
 * Add this as a second file (List.gs) in the "glugo job photos" Apps Script project.
 * It uses ROOT_FOLDER, getFolder() and reply() from Code.gs.
 */

// All job folders with their photos/videos, newest job first.
function listJobs_() {
  const root = getFolder(DriveApp.getRootFolder(), ROOT_FOLDER);
  const jobs = [];
  const folders = root.getFolders();
  while (folders.hasNext()) {
    const f = folders.next();
    const files = [];
    const it = f.getFiles();
    while (it.hasNext()) {
      const x = it.next();
      const mime = x.getMimeType();
      if (!/^(image|video)\//.test(mime)) continue; // skip PDFs/reports
      files.push({
        id: x.getId(),
        name: x.getName(),
        mime: mime,
        t: x.getDateCreated().getTime(),
        note: x.getDescription() || '',
        size: x.getSize()
      });
    }
    files.sort((a, b) => a.t - b.t);
    jobs.push({
      id: f.getId(),
      name: f.getName(),
      updated: files.length ? files[files.length - 1].t : f.getLastUpdated().getTime(),
      files: files
    });
  }
  jobs.sort((a, b) => b.updated - a.updated);
  return { ok: true, jobs: jobs };
}

// Small preview for the grid.
function thumb_(id) {
  const file = DriveApp.getFileById(id);
  let blob = null;
  try { blob = file.getThumbnail(); } catch (e) {}
  if (!blob) return { ok: true, data: '' };
  return { ok: true, mime: blob.getContentType() || 'image/png', data: Utilities.base64Encode(blob.getBytes()) };
}

// Full-size photo for zooming in.
function full_(id) {
  const file = DriveApp.getFileById(id);
  if (!/^image\//.test(file.getMimeType())) return { ok: false, error: 'not a photo' };
  if (file.getSize() > 30 * 1024 * 1024) return { ok: false, error: 'too big' };
  const blob = file.getBlob();
  return { ok: true, mime: blob.getContentType(), data: Utilities.base64Encode(blob.getBytes()) };
}
