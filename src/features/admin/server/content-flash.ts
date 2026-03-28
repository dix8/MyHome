export function contentStatusMessage(status?: string) {
  switch (status) {
    case "project-created":
      return "已新增项目，并自动定位到新项目卡片。";
    case "project-deleted":
      return "项目已删除。";
    case "skill-group-created":
      return "已新增技能分组，并自动定位到新分组。";
    case "skill-group-deleted":
      return "技能分组已删除。";
    case "skill-item-created":
      return "已新增技能项，并自动定位到新技能项。";
    case "skill-item-deleted":
      return "技能项已删除。";
    case "contact-created":
      return "已新增联系方式，并自动定位到新卡片。";
    case "contact-deleted":
      return "联系方式已删除。";
    case "order-updated":
      return "排序已更新。";
    default:
      return null;
  }
}
