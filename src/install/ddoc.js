const getApplicationDdoc = () => {
  // If we got here through the 'install' action type we'll already have this
  // loaded into memory. Otherwise (ie a 'stage' then 'complete') we need to
  // load it again.
  if (ddoc) {
    return ddoc;
  } else {
    debug('Loading application ddoc');
    const ddocId = utils.getStagedDdocId(`_design/${deployDoc.build_info.application}`);
    return api.getAttachments(ddocId)
  }
};
