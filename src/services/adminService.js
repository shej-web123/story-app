import api from './api';

export const logAdminAction = async (action, target, details, adminId, adminName) => {
    try {
        await api.post('/audit_logs', {
            action,
            target,
            details,
            adminId,
            adminName,
            createdAt: new Date().toISOString()
        });
    } catch (error) {
        console.error("Failed to log admin action", error);
    }
};

export const fetchAuditLogs = async (limit = 20) => {
    try {
        const res = await api.get(`/audit_logs?_sort=createdAt&_order=desc&_limit=${limit}`);
        return res.data;
    } catch (error) {
        console.error("Failed to fetch audit logs", error);
        return [];
    }
};
