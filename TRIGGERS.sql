-- =============================================
-- AUTOMATED POINTS SYSTEM TRIGGERS
-- Run this in Supabase SQL Editor to enable gamification
-- =============================================

-- 1. Function to award points
CREATE OR REPLACE FUNCTION public.award_points()
RETURNS TRIGGER AS $$
DECLARE
  target_user_id UUID;
  points_to_award INTEGER;
BEGIN
  -- Case 1: New Resource Upload (+10 pts to uploader)
  IF (TG_TABLE_NAME = 'resources' AND TG_OP = 'INSERT') THEN
    target_user_id := NEW.uploader_id;
    points_to_award := 10;
  
  -- Case 2: New Download (+2 pts to uploader)
  ELSIF (TG_TABLE_NAME = 'downloads' AND TG_OP = 'INSERT') THEN
    -- Get uploader_id from the resource being downloaded
    SELECT uploader_id INTO target_user_id FROM public.resources WHERE id = NEW.resource_id;
    points_to_award := 2;
    
    -- Optional: Don't award points if uploader downloads own file? 
    -- IF target_user_id = NEW.user_id THEN RETURN NEW; END IF;

  -- Case 3: New Rating (+1 pt to uploader)
  ELSIF (TG_TABLE_NAME = 'ratings' AND TG_OP = 'INSERT') THEN
    SELECT uploader_id INTO target_user_id FROM public.resources WHERE id = NEW.resource_id;
    points_to_award := 1;
  END IF;

  -- Update the user's points
  IF target_user_id IS NOT NULL THEN
    UPDATE public.profiles 
    SET points = points + points_to_award 
    WHERE id = target_user_id;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;


-- 2. Create Triggers

-- Trigger for Uploads
DROP TRIGGER IF EXISTS on_resource_upload ON public.resources;
CREATE TRIGGER on_resource_upload
  AFTER INSERT ON public.resources
  FOR EACH ROW EXECUTE PROCEDURE public.award_points();

-- Trigger for Downloads
DROP TRIGGER IF EXISTS on_resource_download ON public.downloads;
CREATE TRIGGER on_resource_download
  AFTER INSERT ON public.downloads
  FOR EACH ROW EXECUTE PROCEDURE public.award_points();

-- Trigger for Ratings
DROP TRIGGER IF EXISTS on_resource_rating ON public.ratings;
CREATE TRIGGER on_resource_rating
  AFTER INSERT ON public.ratings
  FOR EACH ROW EXECUTE PROCEDURE public.award_points();
