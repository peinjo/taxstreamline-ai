import { supabase } from "@/lib/supabase";
import { toast } from "sonner";

export async function uploadTaxDocument(file: File) {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error("No authenticated user");

    const fileExt = file.name.split('.').pop();
    const fileName = `${user.id}/${crypto.randomUUID()}.${fileExt}`;
    const filePath = `${fileName}`;

    const { error: uploadError } = await supabase.storage
      .from('tax_documents')
      .upload(filePath, file);

    if (uploadError) throw uploadError;

    const { data: { publicUrl } } = supabase.storage
      .from('tax_documents')
      .getPublicUrl(filePath);

    const { error: dbError } = await supabase
      .from('tax_documents')
      .insert({
        filename: file.name,
        file_path: filePath,
        content_type: file.type,
        size: file.size,
        user_id: user.id
      });

    if (dbError) throw dbError;

    return publicUrl;
  } catch (error) {
    console.error('Error uploading file:', error);
    throw error;
  }
}

export async function deleteTaxDocument(filePath: string, id: number) {
  try {
    const { error: storageError } = await supabase.storage
      .from('tax_documents')
      .remove([filePath]);

    if (storageError) throw storageError;

    const { error: dbError } = await supabase
      .from('tax_documents')
      .delete()
      .eq('id', id);

    if (dbError) throw dbError;
  } catch (error) {
    console.error('Error deleting file:', error);
    throw error;
  }
}