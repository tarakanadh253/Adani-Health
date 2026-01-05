import { useState, useEffect } from "react";
import { localDataService } from "@/services/localData";
import { Bell, Search, User, Clock, Wifi, Settings, LogOut, FileText, CheckCircle, AlertTriangle, Box, Folder, Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
  PopoverAnchor
} from "@/components/ui/popover";
import { ScrollArea } from "@/components/ui/scroll-area";

export function TopBar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<any>(null);
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  useEffect(() => {
    const handleSearch = async () => {
      if (searchQuery.length > 1) {
        const results = await localDataService.searchGlobal(searchQuery);
        setSearchResults(results);
        setIsSearchOpen(true);
      } else {
        setSearchResults(null);
        setIsSearchOpen(false);
      }
    };
    const debounce = setTimeout(handleSearch, 300);
    return () => clearTimeout(debounce);
  }, [searchQuery]);
  const [currentDate, setCurrentDate] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentDate(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const timeString = currentDate.toLocaleTimeString("en-IN", {
    hour: "2-digit",
    minute: "2-digit",
    timeZone: "Asia/Kolkata",
  });

  const dateString = currentDate.toLocaleDateString("en-IN", {
    weekday: "short",
    day: "numeric",
    month: "short",
    year: "numeric",
  });

  return (
    <header className="h-16 border-b border-border bg-card/50 backdrop-blur-sm px-6 flex items-center justify-between">
      {/* Left: Search */}
      <div className="flex items-center gap-4 flex-1 max-w-xl z-50">
        <div className="relative flex-1">
          <Popover open={isSearchOpen} onOpenChange={setIsSearchOpen}>
            <PopoverAnchor asChild>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Search modules, assets, documents..."
                  className="pl-10 bg-background/50 border-border/50 focus:border-primary w-full"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onFocus={() => {
                    if (searchQuery.length > 1 && searchResults) {
                      setIsSearchOpen(true);
                    }
                  }}
                />
              </div>
            </PopoverAnchor>
            <PopoverContent
              className="w-[500px] p-0"
              align="start"
              onOpenAutoFocus={(e) => e.preventDefault()}
            >
              <ScrollArea className="h-[400px]">
                <div className="p-4 space-y-4">
                  {!searchResults || (Object.keys(searchResults).every(k => searchResults[k].length === 0)) ? (
                    <p className="text-sm text-muted-foreground text-center py-4">No results found</p>
                  ) : (
                    <>
                      {searchResults.assets?.length > 0 && (
                        <div>
                          <h4 className="text-xs font-semibold text-muted-foreground mb-2 flex items-center gap-2">
                            <Box className="w-3 h-3" /> Assets
                          </h4>
                          <div className="space-y-1">
                            {searchResults.assets.map((item: any) => (
                              <div key={item.id} className="p-2 hover:bg-muted/50 rounded cursor-pointer group" onClick={() => navigate('/assets')}>
                                <p className="text-sm font-medium group-hover:text-primary">{item.name}</p>
                                <p className="text-xs text-muted-foreground">{item.type} • {item.location}</p>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {searchResults.issues?.length > 0 && (
                        <div>
                          <h4 className="text-xs font-semibold text-muted-foreground mb-2 mt-4 flex items-center gap-2">
                            <AlertTriangle className="w-3 h-3" /> Issues
                          </h4>
                          <div className="space-y-1">
                            {searchResults.issues.map((item: any) => (
                              <div key={item.id} className="p-2 hover:bg-muted/50 rounded cursor-pointer group" onClick={() => navigate('/')}>
                                <p className="text-sm font-medium group-hover:text-primary">{item.title}</p>
                                <p className="text-xs text-muted-foreground">{item.id} • {item.status}</p>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {searchResults.rooms?.length > 0 && (
                        <div>
                          <h4 className="text-xs font-semibold text-muted-foreground mb-2 mt-4 flex items-center gap-2">
                            <Folder className="w-3 h-3" /> Rooms
                          </h4>
                          <div className="space-y-1">
                            {searchResults.rooms.map((item: any) => (
                              <div key={item.id} className="p-2 hover:bg-muted/50 rounded cursor-pointer group" onClick={() => navigate('/clinical')}>
                                <p className="text-sm font-medium group-hover:text-primary">{item.roomName}</p>
                                <p className="text-xs text-muted-foreground">{item.roomCode} • {item.department}</p>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {searchResults.milestones?.length > 0 && (
                        <div>
                          <h4 className="text-xs font-semibold text-muted-foreground mb-2 mt-4 flex items-center gap-2">
                            <Calendar className="w-3 h-3" /> Milestones
                          </h4>
                          <div className="space-y-1">
                            {searchResults.milestones.map((item: any) => (
                              <div key={item.id} className="p-2 hover:bg-muted/50 rounded cursor-pointer group" onClick={() => navigate('/idd-spine')}>
                                <p className="text-sm font-medium group-hover:text-primary">{item.name}</p>
                                <p className="text-xs text-muted-foreground">{item.phase} • {item.date}</p>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </>
                  )}
                </div>
              </ScrollArea>
            </PopoverContent>
          </Popover>
        </div>
      </div>

      {/* Center: System Status */}
      <div className="hidden lg:flex items-center gap-6 px-8">
        <div className="flex items-center gap-2 text-sm">
          <Wifi className="w-4 h-4 text-success" />
          <span className="text-muted-foreground">All Systems Operational</span>
        </div>
        <div className="h-4 w-px bg-border" />
        <div className="flex items-center gap-2 text-sm">
          <Clock className="w-4 h-4 text-primary" />
          <span className="font-mono text-foreground">{timeString}</span>
          <span className="text-muted-foreground">IST</span>
        </div>
        <div className="text-xs text-muted-foreground">{dateString}</div>
      </div>

      {/* Right: Actions */}
      <div className="flex items-center gap-2">
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="ghost" size="icon" className="relative">
              <Bell className="w-5 h-5" />
              <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-accent animate-pulse" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-80 p-0" align="end">
            <div className="p-4 border-b border-border">
              <h4 className="font-semibold leading-none">Notifications</h4>
              <p className="text-xs text-muted-foreground mt-1">You have 3 unread messages</p>
            </div>
            <ScrollArea className="h-[300px]">
              <div className="p-4 space-y-4">
                <div className="flex gap-3">
                  <div className="mt-1">
                    <AlertTriangle className="w-4 h-4 text-destructive" />
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm font-medium">Critical Issue: HVAC Failure</p>
                    <p className="text-xs text-muted-foreground">OT-1 HVAC system reporting failure. Immediate attention required.</p>
                    <p className="text-xs text-muted-foreground pt-1">2 mins ago</p>
                  </div>
                </div>
                <div className="flex gap-3">
                  <div className="mt-1">
                    <CheckCircle className="w-4 h-4 text-success" />
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm font-medium">Design Approved</p>
                    <p className="text-xs text-muted-foreground">Radiology Wing Layout v4.2 approved by Clinical Lead.</p>
                    <p className="text-xs text-muted-foreground pt-1">1 hour ago</p>
                  </div>
                </div>
                <div className="flex gap-3">
                  <div className="mt-1">
                    <FileText className="w-4 h-4 text-primary" />
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm font-medium">New RFI Submitted</p>
                    <p className="text-xs text-muted-foreground">RFI-005 regarding medical gas outlets in ICU.</p>
                    <p className="text-xs text-muted-foreground pt-1">3 hours ago</p>
                  </div>
                </div>
              </div>
            </ScrollArea>
          </PopoverContent>
        </Popover>

        <div className="h-8 w-px bg-border mx-2" />

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="gap-2">
              <div className="w-8 h-8 rounded-full gradient-primary flex items-center justify-center">
                <User className="w-4 h-4 text-primary-foreground" />
              </div>
              <div className="hidden sm:block text-left">
                <p className="text-sm font-medium">{user?.name || 'Guest'}</p>
                <p className="text-xs text-muted-foreground">{user?.department || 'Visitor'}</p>
              </div>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuLabel>My Account</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => navigate("/profile")}>
              <User className="mr-2 w-4 h-4" />
              <span>Profile</span>
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => navigate("/settings")}>
              <Settings className="mr-2 w-4 h-4" />
              <span>Settings</span>
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => navigate("/my-tasks")}>
              <FileText className="mr-2 w-4 h-4" />
              <span>My Tasks</span>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem className="text-destructive focus:text-destructive" onClick={() => logout && logout()}>
              <LogOut className="mr-2 w-4 h-4" />
              <span>Log out</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
