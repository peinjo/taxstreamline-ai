
-- 1.1: Attach report status trigger to tax_reports
CREATE TRIGGER report_status_notification
  AFTER UPDATE ON public.tax_reports
  FOR EACH ROW
  EXECUTE FUNCTION public.notify_report_status_change();

-- 1.2: Drop duplicate uppercase tables
DROP TABLE IF EXISTS public."Activities";
DROP TABLE IF EXISTS public."Dashboard Metrics";
DROP TABLE IF EXISTS public."Deadlines";
