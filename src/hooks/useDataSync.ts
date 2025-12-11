import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useGameStore, Game, GamePlan, Hardware, Location, SeasonalTheme } from '@/store/gameStore';
import { useToast } from '@/hooks/use-toast';

export const useDataSync = () => {
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const { toast } = useToast();
  const store = useGameStore();

  // Fetch all data from database on mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch games with their plans
        const { data: gamesData, error: gamesError } = await supabase
          .from('games')
          .select('*')
          .order('sort_order');
        
        if (gamesError) throw gamesError;

        const { data: plansData, error: plansError } = await supabase
          .from('game_plans')
          .select('*')
          .order('sort_order');
        
        if (plansError) throw plansError;

        // Map games with plans and replace store data
        if (gamesData && plansData) {
          const games: Game[] = gamesData.map(g => ({
            id: g.game_id,
            name: g.name,
            description: g.description || '',
            icon: g.icon || '🎮',
            enabled: g.enabled ?? true,
            plans: plansData
              .filter(p => p.game_id === g.game_id)
              .map(p => ({
                id: p.plan_id,
                name: p.name,
                ram: p.ram || '',
                cpu: p.cpu || '',
                storage: p.storage || '',
                slots: p.slots || '',
                price: Number(p.price) || 0,
                orderLink: p.order_link || '',
              })),
          }));
          
          // Replace all games in store with database data
          store.setGames(games);
        }

        // Fetch hardware
        const { data: hardwareData } = await supabase
          .from('hardware')
          .select('*')
          .order('sort_order');
        
        if (hardwareData) {
          hardwareData.forEach(h => {
            const hw: Hardware = {
              id: h.hardware_id,
              name: h.name,
              description: h.description || '',
              specs: h.specs || '',
            };
            const existing = store.hardware.find(x => x.id === hw.id);
            if (existing) {
              store.updateHardware(hw.id, hw);
            } else {
              store.addHardware(hw);
            }
          });
        }

        // Fetch locations
        const { data: locationsData } = await supabase
          .from('locations')
          .select('*')
          .order('sort_order');
        
        if (locationsData) {
          locationsData.forEach(l => {
            store.updateLocation(l.location_id, {
              id: l.location_id,
              name: l.name,
              country: l.country || '',
              flag: l.flag || '',
              ping: l.ping || '',
              enabled: l.enabled ?? true,
            });
          });
        }

        // Fetch seasonal themes
        const { data: themesData } = await supabase
          .from('seasonal_themes')
          .select('*')
          .order('sort_order');
        
        if (themesData) {
          themesData.forEach(t => {
            store.updateSeasonalTheme(t.theme_id, {
              id: t.theme_id,
              name: t.name,
              icon: t.icon || '',
              enabled: t.enabled ?? false,
              decorations: t.decorations || [],
            });
          });
        }
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Save game to database
  const saveGame = async (game: Game) => {
    setSyncing(true);
    try {
      // Upsert game
      const { error: gameError } = await supabase
        .from('games')
        .upsert({
          game_id: game.id,
          name: game.name,
          description: game.description,
          icon: game.icon,
          enabled: game.enabled,
        }, { onConflict: 'game_id' });
      
      if (gameError) throw gameError;

      // Delete existing plans and insert new ones
      await supabase.from('game_plans').delete().eq('game_id', game.id);
      
      if (game.plans.length > 0) {
        const { error: plansError } = await supabase
          .from('game_plans')
          .insert(game.plans.map((p, idx) => ({
            game_id: game.id,
            plan_id: p.id,
            name: p.name,
            ram: p.ram,
            cpu: p.cpu,
            storage: p.storage,
            slots: p.slots,
            price: p.price,
            order_link: p.orderLink,
            sort_order: idx,
          })));
        
        if (plansError) throw plansError;
      }

      store.updateGame(game.id, game);
      toast({ title: 'Game saved to all devices' });
    } catch (error) {
      console.error('Error saving game:', error);
      toast({ title: 'Error saving game', variant: 'destructive' });
    } finally {
      setSyncing(false);
    }
  };

  // Delete game from database
  const deleteGame = async (gameId: string) => {
    setSyncing(true);
    try {
      const { error } = await supabase.from('games').delete().eq('game_id', gameId);
      if (error) throw error;
      
      store.deleteGame(gameId);
      toast({ title: 'Game deleted' });
    } catch (error) {
      console.error('Error deleting game:', error);
      toast({ title: 'Error deleting game', variant: 'destructive' });
    } finally {
      setSyncing(false);
    }
  };

  // Save location to database
  const saveLocation = async (location: Location) => {
    setSyncing(true);
    try {
      const { error } = await supabase
        .from('locations')
        .upsert({
          location_id: location.id,
          name: location.name,
          country: location.country,
          flag: location.flag,
          ping: location.ping,
          enabled: location.enabled,
        }, { onConflict: 'location_id' });
      
      if (error) throw error;
      
      store.updateLocation(location.id, location);
      toast({ title: 'Location updated' });
    } catch (error) {
      console.error('Error saving location:', error);
      toast({ title: 'Error saving location', variant: 'destructive' });
    } finally {
      setSyncing(false);
    }
  };

  // Save seasonal theme to database
  const saveSeasonalTheme = async (theme: SeasonalTheme) => {
    setSyncing(true);
    try {
      const { error } = await supabase
        .from('seasonal_themes')
        .upsert({
          theme_id: theme.id,
          name: theme.name,
          icon: theme.icon,
          enabled: theme.enabled,
          decorations: theme.decorations,
        }, { onConflict: 'theme_id' });
      
      if (error) throw error;
      
      store.updateSeasonalTheme(theme.id, theme);
      toast({ title: 'Theme updated' });
    } catch (error) {
      console.error('Error saving theme:', error);
      toast({ title: 'Error saving theme', variant: 'destructive' });
    } finally {
      setSyncing(false);
    }
  };

  return {
    loading,
    syncing,
    saveGame,
    deleteGame,
    saveLocation,
    saveSeasonalTheme,
  };
};
