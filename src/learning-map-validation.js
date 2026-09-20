export function validateLearningMap(map, articleIds) {
  const errors = [];
  const nodeIds = new Set();
  const nodes = [];

  for (const chapter of map?.chapters ?? []) {
    for (const node of chapter.nodes ?? []) {
      if (nodeIds.has(node.id)) errors.push(`duplicate node id: ${node.id}`);
      nodeIds.add(node.id);
      nodes.push(node);
      if (!articleIds.has(node.articleId)) errors.push(`${node.id}: missing article ${node.articleId}`);
      if (!['main', 'support'].includes(node.kind)) errors.push(`${node.id}: invalid kind ${node.kind}`);
      if (!Number.isInteger(node.lane)) errors.push(`${node.id}: lane must be an integer`);
    }
  }

  const mainIds = new Set(nodes.filter(node => node.kind === 'main').map(node => node.id));
  for (const node of nodes) {
    for (const prerequisite of node.prerequisites ?? []) {
      if (!nodeIds.has(prerequisite)) errors.push(`${node.id}: missing prerequisite ${prerequisite}`);
    }
    if (node.kind === 'support') {
      if (!node.attachedTo || !mainIds.has(node.attachedTo)) {
        errors.push(`${node.id}: invalid attachedTo ${node.attachedTo ?? '(missing)'}`);
      }
    }
  }

  return errors;
}
